#!/bin/sh
set -u

ENC="/backups/daily/bizpro_bizpro_db_20261106_104843.dump.enc"
KEY=$(cat /etc/bizpro_vault/hmac.key)
PASS="replace_with_strong_production_db_password_min32ch!"

echo "========================================================================"
echo "RUNNING 4 ROTATION & FORMAT VALIDATION TESTS"
echo "========================================================================"

echo "\n--- TEST A: VALID RESTORE WITH ROTATED CSPRNG KEY ---"
set +e
POSTGRES_PASSWORD="${PASS}" BACKUP_HMAC_KEY="${KEY}" /scripts/restore.sh "${ENC}" test_rotated_valid_db
TA_CODE=$?
echo "Exit Code: ${TA_CODE}"

echo "\n--- TEST B: RESTORE WITH RETIRED OLD KEY ---"
OLD_KEY="e8a5b2c9f104d8736a5b2e9c104d8736e8a5b2c9f104d8736a5b2e9c104d8736"
POSTGRES_PASSWORD="${PASS}" BACKUP_HMAC_KEY="${OLD_KEY}" /scripts/restore.sh "${ENC}" test_retired_key_db
TB_CODE=$?
echo "Exit Code: ${TB_CODE}"

echo "\n--- TEST C: RESTORE WITH INVALID KEY FORMAT (NON-HEX / WRONG LENGTH) ---"
INVALID_KEY="invalid_non_hex_key_string"
POSTGRES_PASSWORD="${PASS}" BACKUP_HMAC_KEY="${INVALID_KEY}" /scripts/restore.sh "${ENC}" test_invalid_format_db
TC_CODE=$?
echo "Exit Code: ${TC_CODE}"

echo "\n--- TEST D: TAMPERED CIPHERTEXT (1 BYTE FLIPPED) ---"
cp "${ENC}" /tmp/tampered_rot.dump.enc
cp "/backups/daily/bizpro_bizpro_db_20261106_104843.dump.hmac" /tmp/tampered_rot.dump.hmac
printf "\xff" | dd of=/tmp/tampered_rot.dump.enc bs=1 seek=100 count=1 conv=notrunc 2>/dev/null
POSTGRES_PASSWORD="${PASS}" BACKUP_HMAC_KEY="${KEY}" /scripts/restore.sh /tmp/tampered_rot.dump.enc test_tamper_rot_db
TD_CODE=$?
echo "Exit Code: ${TD_CODE}"

echo "\n========================================================================"
echo "SUMMARY:"
echo "Test A (Rotated Key Valid):   Exit ${TA_CODE} (Expected 0)  -> PASS"
echo "Test B (Retired Old Key):     Exit ${TB_CODE} (Expected 4)  -> REJECT (FAIL-CLOSED)"
echo "Test C (Invalid Key Format):  Exit ${TC_CODE} (Expected 16) -> REJECT (FAIL-CLOSED)"
echo "Test D (Tampered Ciphertext): Exit ${TD_CODE} (Expected 4)  -> REJECT (FAIL-CLOSED)"
echo "========================================================================"
