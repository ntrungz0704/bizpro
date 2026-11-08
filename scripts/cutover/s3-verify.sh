#!/bin/sh
# ==============================================================================
# BIZPRO+ PRODUCTION CUTOVER KIT: S3 STORAGE VERIFICATION (OPS-01)
# Supports AWS S3, MinIO, Cloudflare R2 and S3-compatible object storage
# Features: Preflight Checks, Dry-run mode, Upload/Download Roundtrip,
# SHA-256 & HMAC Checksum Reconciliation, Disaster Recovery Drill Validation
# ==============================================================================

set -eu

DRY_RUN=0
VERBOSE=0
BACKUP_FILE="${1:-}"

for arg in "$@"; do
  case "$arg" in
    --dry-run)
      DRY_RUN=1
      ;;
    --verbose)
      VERBOSE=1
      ;;
    --help|-h)
      echo "Usage: $0 [options] [path_to_backup.dump.enc]"
      echo "Options:"
      echo "  --dry-run     Validate configuration, credentials & bucket access without modifying data"
      echo "  --verbose     Display detailed network output"
      echo "  --help, -h    Show this help message"
      exit 0
      ;;
  esac
done

TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "{\"timestamp\":\"${TIMESTAMP}\",\"event\":\"s3_verification_started\",\"dry_run\":${DRY_RUN}}"

# ------------------------------------------------------------------------------
# 1. ENVIRONMENT & PREFLIGHT VALIDATION (FAIL-CLOSED)
# ------------------------------------------------------------------------------
S3_BUCKET="${S3_BACKUP_BUCKET:-}"
S3_ENDPOINT="${S3_ENDPOINT_URL:-}"
AWS_ACCESS_KEY="${AWS_ACCESS_KEY_ID:-}"
AWS_SECRET_KEY="${AWS_SECRET_ACCESS_KEY:-}"
AWS_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

if [ -z "${S3_BUCKET}" ] || [ -z "${AWS_ACCESS_KEY}" ] || [ -z "${AWS_SECRET_KEY}" ]; then
  echo "=================================================================" >&2
  echo "[OPS-01 BLOCKED BY ENVIRONMENT] Missing S3 Cloud Credentials" >&2
  echo "Required environment variables:" >&2
  echo " - S3_BACKUP_BUCKET        : [${S3_BUCKET:-MISSING}]" >&2
  echo " - AWS_ACCESS_KEY_ID       : [${AWS_ACCESS_KEY:-MISSING}]" >&2
  echo " - AWS_SECRET_ACCESS_KEY   : [$( [ -n "${AWS_SECRET_KEY}" ] && echo "CONFIGURED" || echo "MISSING" )]" >&2
  echo " - S3_ENDPOINT_URL (Opt.)  : [${S3_ENDPOINT:-Default AWS}]" >&2
  echo "Resolution: Provision cloud bucket and inject credentials before cutover." >&2
  echo "=================================================================" >&2
  echo "{\"timestamp\":\"${TIMESTAMP}\",\"event\":\"s3_verification_blocked\",\"status\":\"BLOCKED_BY_ENVIRONMENT\",\"exit_code\":2}"
  exit 2
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "ERROR: [OPS-01 PREFLIGHT] AWS CLI binary 'aws' is not installed." >&2
  echo "{\"timestamp\":\"${TIMESTAMP}\",\"event\":\"s3_verification_failed\",\"error\":\"aws_cli_missing\",\"exit_code\":1}"
  exit 1
fi

S3_ENDPOINT_FLAG=""
if [ -n "${S3_ENDPOINT}" ]; then
  S3_ENDPOINT_FLAG="--endpoint-url ${S3_ENDPOINT}"
fi

# ------------------------------------------------------------------------------
# 2. BUCKET CONNECTIVITY & ACCESS PREFLIGHT
# ------------------------------------------------------------------------------
echo "Verifying S3 bucket connectivity and access permissions on s3://${S3_BUCKET}..."
set +e
if [ -n "${S3_ENDPOINT_FLAG}" ]; then
  BUCKET_CHECK=$(aws ${S3_ENDPOINT_FLAG} s3 ls "s3://${S3_BUCKET}" 2>&1)
  CHECK_STATUS=$?
else
  BUCKET_CHECK=$(aws s3 ls "s3://${S3_BUCKET}" 2>&1)
  CHECK_STATUS=$?
fi
set -e

if [ ${CHECK_STATUS} -ne 0 ]; then
  echo "ERROR: [OPS-01 PREFLIGHT] Cannot access S3 bucket 's3://${S3_BUCKET}'." >&2
  echo "Error details: ${BUCKET_CHECK}" >&2
  echo "{\"timestamp\":\"${TIMESTAMP}\",\"event\":\"s3_connectivity_failed\",\"bucket\":\"${S3_BUCKET}\",\"exit_code\":3}"
  exit 3
fi

echo "S3 bucket 's3://${S3_BUCKET}' connectivity verified successfully."

if [ "${DRY_RUN}" -eq 1 ]; then
  echo "{\"timestamp\":\"${TIMESTAMP}\",\"event\":\"s3_dry_run_success\",\"bucket\":\"${S3_BUCKET}\",\"status\":\"READY_FOR_CUTOVER\"}"
  exit 0
fi

# ------------------------------------------------------------------------------
# 3. SELECT LOCAL BACKUP ARTIFACT FOR ROUNDTRIP VERIFICATION
# ------------------------------------------------------------------------------
if [ -z "${BACKUP_FILE}" ] || [ ! -f "${BACKUP_FILE}" ]; then
  # Auto-discover latest valid daily backup
  BACKUP_FILE=$(find /backups/daily -type f -name "*.dump.enc" 2>/dev/null | sort -r | head -n 1 || true)
fi

if [ -z "${BACKUP_FILE}" ] || [ ! -f "${BACKUP_FILE}" ]; then
  echo "ERROR: [OPS-01] No local encrypted backup found for S3 roundtrip test." >&2
  exit 4
fi

BASE_DIR=$(dirname "${BACKUP_FILE}")
BASE_NAME=$(basename "${BACKUP_FILE}" .enc)
HMAC_FILE="${BASE_DIR}/${BASE_NAME}.hmac"
META_FILE="${BASE_DIR}/${BASE_NAME}.json"

if [ ! -f "${HMAC_FILE}" ] || [ ! -f "${META_FILE}" ]; then
  echo "ERROR: [OPS-01] Missing companion HMAC or Metadata file for ${BACKUP_FILE}." >&2
  exit 4
fi

LOCAL_SHA256=$(sha256sum "${BACKUP_FILE}" | awk '{print $1}')
LOCAL_HMAC=$(cat "${HMAC_FILE}" | tr -d ' \r\n')

echo "Selected local backup artifact: ${BACKUP_FILE}"
echo " - Ciphertext SHA-256: ${LOCAL_SHA256}"
echo " - MAC Signature:     ${LOCAL_HMAC}"

# ------------------------------------------------------------------------------
# 4. EXECUTE S3 UPLOAD
# ------------------------------------------------------------------------------
REMOTE_PREFIX="s3://${S3_BUCKET}/cutover_verification"
echo "Uploading backup artifacts to ${REMOTE_PREFIX}..."

aws ${S3_ENDPOINT_FLAG} s3 cp "${BACKUP_FILE}" "${REMOTE_PREFIX}/${BASE_NAME}.enc"
aws ${S3_ENDPOINT_FLAG} s3 cp "${HMAC_FILE}" "${REMOTE_PREFIX}/${BASE_NAME}.hmac"
aws ${S3_ENDPOINT_FLAG} s3 cp "${META_FILE}" "${REMOTE_PREFIX}/${BASE_NAME}.json"

echo "Upload completed successfully."

# ------------------------------------------------------------------------------
# 5. EXECUTE DOWNLOAD ROUNDTRIP TO SCRATCH DIRECTORY
# ------------------------------------------------------------------------------
DOWNLOAD_DIR="/tmp/s3_verification_${TIMESTAMP}"
mkdir -p "${DOWNLOAD_DIR}"
trap 'rm -rf "${DOWNLOAD_DIR}"' EXIT INT TERM

echo "Downloading remote artifacts back from S3 to verify retrieval..."
aws ${S3_ENDPOINT_FLAG} s3 cp "${REMOTE_PREFIX}/${BASE_NAME}.enc" "${DOWNLOAD_DIR}/${BASE_NAME}.enc"
aws ${S3_ENDPOINT_FLAG} s3 cp "${REMOTE_PREFIX}/${BASE_NAME}.hmac" "${DOWNLOAD_DIR}/${BASE_NAME}.hmac"

# ------------------------------------------------------------------------------
# 6. INTEGRITY & CRYPTOGRAPHIC RECONCILIATION
# ------------------------------------------------------------------------------
DOWNLOAD_SHA256=$(sha256sum "${DOWNLOAD_DIR}/${BASE_NAME}.enc" | awk '{print $1}')
DOWNLOAD_HMAC=$(cat "${DOWNLOAD_DIR}/${BASE_NAME}.hmac" | tr -d ' \r\n')

if [ "${LOCAL_SHA256}" != "${DOWNLOAD_SHA256}" ]; then
  echo "CRITICAL FAILURE: SHA-256 checksum mismatch after S3 roundtrip!" >&2
  echo "Expected: ${LOCAL_SHA256}" >&2
  echo "Actual:   ${DOWNLOAD_SHA256}" >&2
  echo "Local backups preserved safely. Cloud cutover verification rejected." >&2
  exit 5
fi

if [ "${LOCAL_HMAC}" != "${DOWNLOAD_HMAC}" ]; then
  echo "CRITICAL FAILURE: HMAC signature mismatch after S3 roundtrip!" >&2
  exit 5
fi

echo "Cryptographic integrity reconciled 100%: Local and remote copies are byte-for-byte identical."

# Clean up remote test artifacts to preserve bucket hygiene
aws ${S3_ENDPOINT_FLAG} s3 rm "${REMOTE_PREFIX}/${BASE_NAME}.enc" >/dev/null 2>&1 || true
aws ${S3_ENDPOINT_FLAG} s3 rm "${REMOTE_PREFIX}/${BASE_NAME}.hmac" >/dev/null 2>&1 || true
aws ${S3_ENDPOINT_FLAG} s3 rm "${REMOTE_PREFIX}/${BASE_NAME}.json" >/dev/null 2>&1 || true

END_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "{\"timestamp\":\"${END_TIME}\",\"event\":\"s3_verification_passed\",\"status\":\"PASS\",\"bucket\":\"${S3_BUCKET}\",\"sha256\":\"${LOCAL_SHA256}\"}"
exit 0
