#!/bin/sh
# ==============================================================================
# BIZPRO+ AUTOMATED CONTINUOUS BACKUP ENGINE — PHASE 3F (FINAL RECONCILED)
# Standards: Encrypt-then-MAC (HMAC-SHA-256 Authentication of Ciphertext),
# Strict 64-Hex Enforcement, Zero ASCII Fallback, Explicit OpenSSL Error Checking
# ==============================================================================

set -eu

START_TIME=$(date +%s)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DAY_OF_WEEK=$(date +%u) # 1=Monday, 7=Sunday
DAY_OF_MONTH=$(date +%d)

POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-bizpro_app}"
POSTGRES_DB="${POSTGRES_DB:-bizpro_db}"
PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is mandatory}"
export PGPASSWORD

BACKUP_DIR="${BACKUP_LOCAL_DIR:-/backups}"
BACKUP_ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-bizpro_production_vault_key_2026_aes256}"
BACKUP_HMAC_KEY="${BACKUP_HMAC_KEY:-}"
S3_BUCKET="${S3_BACKUP_BUCKET:-}"
S3_ENDPOINT="${S3_ENDPOINT_URL:-}"
ALERT_WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"

mkdir -p "${BACKUP_DIR}/daily" "${BACKUP_DIR}/weekly" "${BACKUP_DIR}/monthly" "${BACKUP_DIR}/wal"

BACKUP_NAME="bizpro_${POSTGRES_DB}_${TIMESTAMP}"
DUMP_FILE="${BACKUP_DIR}/daily/${BACKUP_NAME}.dump"
ENC_FILE="${DUMP_FILE}.enc"
SHA_FILE="${DUMP_FILE}.sha256"
HMAC_FILE="${DUMP_FILE}.hmac"
META_FILE="${DUMP_FILE}.json"

echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"event\":\"backup_started\",\"database\":\"${POSTGRES_DB}\",\"host\":\"${POSTGRES_HOST}\"}"

# Step 1: Consistent PostgreSQL custom archive dump
if ! pg_dump -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
     -Fc -Z 6 -f "${DUMP_FILE}"; then
  echo "ERROR: pg_dump execution failed for ${POSTGRES_DB}." >&2
  if [ -n "${ALERT_WEBHOOK_URL}" ]; then
    /scripts/alert-webhook.sh "BACKUP_FAILURE" "pg_dump failed for ${POSTGRES_DB}" || true
  fi
  exit 1
fi

RAW_SIZE=$(stat -c%s "${DUMP_FILE}" 2>/dev/null || stat -f%z "${DUMP_FILE}" 2>/dev/null || echo 0)

# Step 2: SHA-256 Checksum on Raw Plaintext Dump (Defense-in-depth)
sha256sum "${DUMP_FILE}" | awk '{print $1}' | tr -d ' \r\n' > "${SHA_FILE}"
RAW_SHA256=$(cat "${SHA_FILE}")

# Step 3: Military-grade AES-256-CBC Encryption with PBKDF2
if ! openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
     -in "${DUMP_FILE}" -out "${ENC_FILE}" -pass "pass:${BACKUP_ENCRYPTION_KEY}"; then
  echo "ERROR: OpenSSL AES-256 encryption failed." >&2
  rm -f "${DUMP_FILE}"
  exit 1
fi

ENC_SIZE=$(stat -c%s "${ENC_FILE}" 2>/dev/null || stat -f%z "${ENC_FILE}" 2>/dev/null || echo 0)

# Step 4: Strict Encrypt-then-MAC (HMAC-SHA-256 - Strict 64-Hex Enforcement)
if [ -z "${BACKUP_HMAC_KEY}" ]; then
  echo "ERROR: [SEC-ENC-01 FAIL-CLOSED] BACKUP_HMAC_KEY is missing or empty." >&2
  rm -f "${DUMP_FILE}" "${ENC_FILE}" "${SHA_FILE}"
  exit 1
fi

if ! echo "${BACKUP_HMAC_KEY}" | grep -qE '^[0-9a-fA-F]{64}$'; then
  echo "ERROR: [SEC-KEY-02 FAIL-CLOSED] BACKUP_HMAC_KEY format invalid. Strict 64-hexadecimal characters required." >&2
  rm -f "${DUMP_FILE}" "${ENC_FILE}" "${SHA_FILE}"
  exit 16
fi

OPENSSL_ERR_LOG="/tmp/openssl_hmac_gen_err_$(date +%s).log"
set +e
OPENSSL_RAW_OUT=$(openssl dgst -sha256 -mac HMAC -macopt "hexkey:${BACKUP_HMAC_KEY}" "${ENC_FILE}" 2>"${OPENSSL_ERR_LOG}")
OPENSSL_STATUS=$?
set -e

if [ "${OPENSSL_STATUS}" -ne 0 ] || [ -z "${OPENSSL_RAW_OUT}" ]; then
  echo "ERROR: [SEC-KEY-02 FAIL-CLOSED] OpenSSL HMAC calculation failed with status ${OPENSSL_STATUS}." >&2
  cat "${OPENSSL_ERR_LOG}" >&2 2>/dev/null || true
  rm -f "${OPENSSL_ERR_LOG}" "${DUMP_FILE}" "${ENC_FILE}" "${SHA_FILE}"
  exit 15
fi
rm -f "${OPENSSL_ERR_LOG}"

HMAC_DIGEST=$(echo "${OPENSSL_RAW_OUT}" | awk '{print $NF}' | tr -d ' \r\n')
echo "${HMAC_DIGEST}" > "${HMAC_FILE}"

if [ -z "${HMAC_DIGEST}" ] || [ "${#HMAC_DIGEST}" -ne 64 ] || [ "${HMAC_DIGEST}" = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" ]; then
  echo "ERROR: Generated HMAC is invalid or empty string hash." >&2
  rm -f "${DUMP_FILE}" "${ENC_FILE}" "${SHA_FILE}" "${HMAC_FILE}"
  exit 1
fi

# Step 5: Generate Backup Metadata (Audit Trail)
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

cat <<EOF > "${META_FILE}"
{
  "backup_name": "${BACKUP_NAME}",
  "database": "${POSTGRES_DB}",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "raw_size_bytes": ${RAW_SIZE},
  "encrypted_size_bytes": ${ENC_SIZE},
  "sha256_checksum": "${RAW_SHA256}",
  "hmac_sha256": "${HMAC_DIGEST}",
  "duration_seconds": ${DURATION},
  "encryption": "AES-256-CBC-PBKDF2",
  "authentication": "HMAC-SHA-256-EtM-64Hex",
  "status": "SUCCESS"
}
EOF

# Step 6: Grandfather-Father-Son (GFS) Promotion
if [ "${DAY_OF_WEEK}" -eq 7 ]; then
  cp "${ENC_FILE}" "${BACKUP_DIR}/weekly/${BACKUP_NAME}.dump.enc"
  cp "${HMAC_FILE}" "${BACKUP_DIR}/weekly/${BACKUP_NAME}.dump.hmac"
  cp "${META_FILE}" "${BACKUP_DIR}/weekly/${BACKUP_NAME}.dump.json"
fi

if [ "${DAY_OF_MONTH}" -eq 01 ]; then
  cp "${ENC_FILE}" "${BACKUP_DIR}/monthly/${BACKUP_NAME}.dump.enc"
  cp "${HMAC_FILE}" "${BACKUP_DIR}/monthly/${BACKUP_NAME}.dump.hmac"
  cp "${META_FILE}" "${BACKUP_DIR}/monthly/${BACKUP_NAME}.dump.json"
fi

# Step 7: GFS Pruning (7 daily, 4 weekly, 12 monthly)
find "${BACKUP_DIR}/daily" -type f -name "*.enc" -mtime +7 -delete 2>/dev/null || true
find "${BACKUP_DIR}/daily" -type f -name "*.dump" -mtime +7 -delete 2>/dev/null || true
find "${BACKUP_DIR}/daily" -type f -name "*.sha256" -mtime +7 -delete 2>/dev/null || true
find "${BACKUP_DIR}/daily" -type f -name "*.hmac" -mtime +7 -delete 2>/dev/null || true
find "${BACKUP_DIR}/daily" -type f -name "*.json" -mtime +7 -delete 2>/dev/null || true

find "${BACKUP_DIR}/weekly" -type f -name "*.enc" -mtime +28 -delete 2>/dev/null || true
find "${BACKUP_DIR}/weekly" -type f -name "*.hmac" -mtime +28 -delete 2>/dev/null || true
find "${BACKUP_DIR}/weekly" -type f -name "*.json" -mtime +28 -delete 2>/dev/null || true

find "${BACKUP_DIR}/monthly" -type f -name "*.enc" -mtime +365 -delete 2>/dev/null || true
find "${BACKUP_DIR}/monthly" -type f -name "*.hmac" -mtime +365 -delete 2>/dev/null || true
find "${BACKUP_DIR}/monthly" -type f -name "*.json" -mtime +365 -delete 2>/dev/null || true

# Step 8: S3 Cloud Upload (if configured)
if [ -n "${S3_BUCKET}" ] && command -v aws >/dev/null 2>&1; then
  S3_ENDPOINT_FLAG=""
  if [ -n "${S3_ENDPOINT}" ]; then
    S3_ENDPOINT_FLAG="--endpoint-url ${S3_ENDPOINT}"
  fi
  aws ${S3_ENDPOINT_FLAG} s3 cp "${ENC_FILE}" "s3://${S3_BUCKET}/daily/${BACKUP_NAME}.dump.enc"
  aws ${S3_ENDPOINT_FLAG} s3 cp "${HMAC_FILE}" "s3://${S3_BUCKET}/daily/${BACKUP_NAME}.dump.hmac"
  aws ${S3_ENDPOINT_FLAG} s3 cp "${META_FILE}" "s3://${S3_BUCKET}/daily/${BACKUP_NAME}.dump.json"
fi

# Clean raw unencrypted dump
rm -f "${DUMP_FILE}"

echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"event\":\"backup_completed\",\"backup_name\":\"${BACKUP_NAME}\",\"size_bytes\":${ENC_SIZE},\"duration_seconds\":${DURATION}}"

if [ -n "${ALERT_WEBHOOK_URL}" ]; then
  /scripts/alert-webhook.sh "BACKUP_SUCCESS" "Daily backup ${BACKUP_NAME} completed (${ENC_SIZE} bytes, ${DURATION}s)" || true
fi
