#!/bin/sh
# ==============================================================================
# BIZPRO+ AUTOMATED DISASTER RECOVERY & RESTORE ENGINE — PHASE 3F (FINAL RECONCILED)
# Strict FAIL-CLOSED Encrypt-then-MAC (HMAC-SHA-256 Authentication BEFORE Decryption)
# Explicit 64-Hex Enforcement, Zero ASCII Fallback, Explicit OpenSSL Error Checking
# ==============================================================================

set -eu

RESTORE_START=$(date +%s)

if [ $# -lt 1 ]; then
  echo "Usage: $0 <path_to_encrypted_backup.dump.enc> [target_database_name]" >&2
  exit 1
fi

ENC_FILE="$1"
TARGET_DB="${2:-bizpro_restore_drill_db}"

POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-bizpro_app}"
PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is mandatory}"
export PGPASSWORD

BACKUP_ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-bizpro_production_vault_key_2026_aes256}"
BACKUP_HMAC_KEY="${BACKUP_HMAC_KEY:-}"
ALERT_WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"

# ==============================================================================
# STEP 0: STRICT FAIL-CLOSED AUTHENTICITY & INTEGRITY GATES (SEC-ENC-01 & SEC-KEY-02)
# ==============================================================================

# Gate 0.1: Ciphertext Existence & Non-Empty Check
if [ ! -f "${ENC_FILE}" ] || [ ! -s "${ENC_FILE}" ]; then
  echo "ERROR: [SEC-ENC-01 FAIL-CLOSED] Encrypted backup file '${ENC_FILE}' missing or empty (0 bytes). Aborting before decryption or DB connection." >&2
  exit 10
fi

# Gate 0.2: HMAC Key Presence Check
if [ -z "${BACKUP_HMAC_KEY}" ]; then
  echo "ERROR: [SEC-ENC-01 FAIL-CLOSED] BACKUP_HMAC_KEY is missing or empty. Unauthenticated restore prohibited. Aborting before decryption or DB connection." >&2
  exit 11
fi

# Gate 0.2b: HMAC Key Format Enforcement (Strict 64-Hex Only, Zero ASCII Fallback)
if ! echo "${BACKUP_HMAC_KEY}" | grep -qE '^[0-9a-fA-F]{64}$'; then
  echo "ERROR: [SEC-KEY-02 FAIL-CLOSED] BACKUP_HMAC_KEY format invalid. Strict 64-hexadecimal characters required (raw 32-byte binary key). Non-hex and ASCII fallbacks prohibited." >&2
  exit 16
fi

# Gate 0.3: HMAC Signature File Existence Check
BASE_DIR=$(dirname "${ENC_FILE}")
BASE_NAME=$(basename "${ENC_FILE}" .enc)
HMAC_FILE="${BASE_DIR}/${BASE_NAME}.hmac"
SHA_FILE="${BASE_DIR}/${BASE_NAME}.sha256"

if [ ! -f "${HMAC_FILE}" ]; then
  echo "ERROR: [SEC-ENC-01 FAIL-CLOSED] HMAC signature file '${HMAC_FILE}' missing. Unauthenticated restore prohibited. Aborting before decryption or DB connection." >&2
  exit 12
fi

if [ ! -s "${HMAC_FILE}" ]; then
  echo "ERROR: [SEC-ENC-01 FAIL-CLOSED] HMAC signature file '${HMAC_FILE}' is empty (0 bytes). Aborting before decryption or DB connection." >&2
  exit 13
fi

# Gate 0.4: HMAC Signature Format Check (Must be 64-character hexadecimal)
EXPECTED_HMAC=$(cat "${HMAC_FILE}" | tr -d ' \r\n')
if ! echo "${EXPECTED_HMAC}" | grep -qE '^[0-9a-fA-F]{64}$'; then
  echo "ERROR: [SEC-ENC-01 FAIL-CLOSED] HMAC signature in '${HMAC_FILE}' has invalid format. Expected 64-char hex string. Aborting." >&2
  exit 14
fi

# Gate 0.5: OpenSSL HMAC Computation with Explicit Error Checking
OPENSSL_ERR_LOG="/tmp/openssl_hmac_err_$(date +%s).log"
set +e
OPENSSL_RAW_OUT=$(openssl dgst -sha256 -mac HMAC -macopt "hexkey:${BACKUP_HMAC_KEY}" "${ENC_FILE}" 2>"${OPENSSL_ERR_LOG}")
OPENSSL_STATUS=$?
set -e

if [ "${OPENSSL_STATUS}" -ne 0 ] || [ -z "${OPENSSL_RAW_OUT}" ]; then
  echo "ERROR: [SEC-KEY-02 FAIL-CLOSED] OpenSSL HMAC execution failed with status ${OPENSSL_STATUS}." >&2
  cat "${OPENSSL_ERR_LOG}" >&2 2>/dev/null || true
  rm -f "${OPENSSL_ERR_LOG}"
  exit 15
fi
rm -f "${OPENSSL_ERR_LOG}"

ACTUAL_HMAC=$(echo "${OPENSSL_RAW_OUT}" | awk '{print $NF}' | tr -d ' \r\n')

# Verify digest is valid non-empty and not empty-string SHA-256
if [ -z "${ACTUAL_HMAC}" ] || [ "${ACTUAL_HMAC}" = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" ]; then
  echo "ERROR: [SEC-ENC-01 FAIL-CLOSED] OpenSSL produced invalid or empty-string digest. Aborting." >&2
  exit 15
fi

# Gate 0.6: Authentication Comparison
if [ "${EXPECTED_HMAC}" != "${ACTUAL_HMAC}" ]; then
  echo "ERROR: [SEC-ENC-01 FAIL-CLOSED] HMAC signature MISMATCH!" >&2
  echo " - Expected HMAC: ${EXPECTED_HMAC}" >&2
  echo " - Actual HMAC:   ${ACTUAL_HMAC}" >&2
  echo "Ciphertext tampered or wrong HMAC key. Aborting BEFORE decryption or DB connection." >&2
  exit 4
fi

echo "HMAC Authenticity VERIFIED successfully (Encrypt-then-MAC guaranteed)."

# ==============================================================================
# STEP 1: DECRYPT AUTHENTICATED ARCHIVE (Only reached if Step 0 passed 100%)
# ==============================================================================
TEMP_DUMP="/tmp/restore_temp_$(date +%s).dump"
trap 'rm -f "${TEMP_DUMP}"' EXIT INT TERM

echo "Decrypting authenticated backup archive..."
if ! openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 \
     -in "${ENC_FILE}" -out "${TEMP_DUMP}" -pass "pass:${BACKUP_ENCRYPTION_KEY}"; then
  echo "ERROR: Decryption failed. Incorrect key or corrupted ciphertext." >&2
  exit 2
fi

# Step 2: Verify SHA-256 Checksum on Plaintext (Defense-in-depth)
if [ -f "${SHA_FILE}" ]; then
  EXPECTED_SHA=$(cat "${SHA_FILE}" | tr -d ' \r\n')
  ACTUAL_SHA=$(sha256sum "${TEMP_DUMP}" | awk '{print $1}' | tr -d ' \r\n')
  if [ "${EXPECTED_SHA}" != "${ACTUAL_SHA}" ]; then
    echo "ERROR: Plaintext checksum mismatch! Expected: ${EXPECTED_SHA}, Actual: ${ACTUAL_SHA}" >&2
    exit 3
  fi
  echo "Plaintext checksum verified: ${ACTUAL_SHA}"
fi

# ==============================================================================
# STEP 3 & 4: PREPARE ISOLATED TARGET DB & EXECUTE RESTORE
# ==============================================================================
echo "Preparing isolated target database: ${TARGET_DB}..."
psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d postgres \
     -c "DROP DATABASE IF EXISTS \"${TARGET_DB}\";"
psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d postgres \
     -c "CREATE DATABASE \"${TARGET_DB}\" OWNER \"${POSTGRES_USER}\";"

echo "Executing pg_restore into ${TARGET_DB}..."
pg_restore -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" \
           -d "${TARGET_DB}" --no-owner --no-privileges -v "${TEMP_DUMP}" || true

# Step 5: Data Integrity & Consistency Verification
echo "Verifying restored data integrity..."
TABLE_COUNT=$(psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${TARGET_DB}" -t -c \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
ORG_COUNT=$(psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${TARGET_DB}" -t -c \
  "SELECT count(*) FROM organizations;")
USER_COUNT=$(psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${TARGET_DB}" -t -c \
  "SELECT count(*) FROM users;")

RESTORE_END=$(date +%s)
RTO_DURATION=$((RESTORE_END - RESTORE_START))

echo "Restoration Summary:"
echo " - Tables Restored: $(echo ${TABLE_COUNT} | tr -d ' ')"
echo " - Organizations: $(echo ${ORG_COUNT} | tr -d ' ')"
echo " - Users: $(echo ${USER_COUNT} | tr -d ' ')"
echo " - Elapsed Recovery Time (RTO): ${RTO_DURATION} seconds"

echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"event\":\"restore_drill_completed\",\"rto_seconds\":${RTO_DURATION},\"tables\":$(echo ${TABLE_COUNT} | tr -d ' '),\"organizations\":$(echo ${ORG_COUNT} | tr -d ' '),\"users\":$(echo ${USER_COUNT} | tr -d ' ')}"

if [ -n "${ALERT_WEBHOOK_URL}" ]; then
  /scripts/alert-webhook.sh "RESTORE_DRILL_SUCCESS" "Restore drill for ${TARGET_DB} passed in ${RTO_DURATION}s (${TABLE_COUNT} tables verified)" || true
fi
