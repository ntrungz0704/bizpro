#!/bin/sh
# ==============================================================================
# BIZPRO+ WAL CONTINUOUS ARCHIVE ENGINE (FOR PITR) — PHASE 3E
# Target: RPO <= 1 hour (Continuous WAL Archival)
# ==============================================================================

set -eu

WAL_SRC="$1"
WAL_NAME="$2"

WAL_DIR="${WAL_ARCHIVE_DIR:-/backups/wal}"
mkdir -p "${WAL_DIR}"

DEST_FILE="${WAL_DIR}/${WAL_NAME}"

# Avoid duplicate overwrite
if [ -f "${DEST_FILE}" ]; then
  echo "WAL file ${WAL_NAME} already archived."
  exit 0
fi

# Copy WAL segment safely via temporary file
cp "${WAL_SRC}" "${DEST_FILE}.tmp"
mv "${DEST_FILE}.tmp" "${DEST_FILE}"

echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"event\":\"wal_archived\",\"wal_name\":\"${WAL_NAME}\"}"
