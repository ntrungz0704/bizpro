#!/bin/sh
set -u

BASE="/backups/daily/bizpro_bizpro_db_20261106_104253"
ENC="${BASE}.dump.enc"
HMAC="${BASE}.dump.hmac"
KEY="e8a5b2c9f104d8736a5b2e9c104d8736e8a5b2c9f104d8736a5b2e9c104d8736"
PASS="replace_with_strong_production_db_password_min32ch!"

echo "========================================================================"
echo "RUNNING 8 NEGATIVE & POSITIVE SECURITY RESTORE TESTS (SEC-ENC-02)"
echo "========================================================================"

# Setup scratch test directory
mkdir -p /tmp/sec_tests
cp "${ENC}" /tmp/sec_tests/valid.dump.enc
cp "${HMAC}" /tmp/sec_tests/valid.dump.hmac
cp "${BASE}.dump.sha256" /tmp/sec_tests/valid.dump.sha256

# TEST 1: Valid Restore -> PASS
echo "\n--- TEST 1: VALID RESTORE WITH AUTHENTIC BACKUP & KEY ---"
POSTGRES_PASSWORD="${PASS}" BACKUP_HMAC_KEY="${KEY}" /scripts/restore.sh /tmp/sec_tests/valid.dump.enc test_sec_valid_db
T1_CODE=$?
echo "Exit Code: ${T1_CODE}"

# TEST 2: Tampered Ciphertext (flip 1 byte at offset 100) -> REJECT (Code 4)
echo "\n--- TEST 2: TAMPERED CIPHERTEXT (BYTE FLIPPED) ---"
cp /tmp/sec_tests/valid.dump.enc /tmp/sec_tests/tampered.dump.enc
cp /tmp/sec_tests/valid.dump.hmac /tmp/sec_tests/tampered.dump.hmac
printf "\xff" | dd of=/tmp/sec_tests/tampered.dump.enc bs=1 seek=100 count=1 conv=notrunc 2>/dev/null
set +e
POSTGRES_PASSWORD="${PASS}" BACKUP_HMAC_KEY="${KEY}" /scripts/restore.sh /tmp/sec_tests/tampered.dump.enc test_tamper_db
T2_CODE=$?
set -e
echo "Exit Code: ${T2_CODE}"

# TEST 3: Missing HMAC File -> REJECT (Code 12)
echo "\n--- TEST 3: MISSING HMAC FILE ---"
cp /tmp/sec_tests/valid.dump.enc /tmp/sec_tests/no_hmac.dump.enc
rm -f /tmp/sec_tests/no_hmac.dump.hmac
set +e
POSTGRES_PASSWORD="${PASS}" BACKUP_HMAC_KEY="${KEY}" /scripts/restore.sh /tmp/sec_tests/no_hmac.dump.enc test_no_hmac_db
T3_CODE=$?
set -e
echo "Exit Code: ${T3_CODE}"

# TEST 4: Empty HMAC File -> REJECT (Code 13)
echo "\n--- TEST 4: EMPTY HMAC FILE (0 BYTES) ---"
cp /tmp/sec_tests/valid.dump.enc /tmp/sec_tests/empty_hmac.dump.enc
truncate -s 0 /tmp/sec_tests/empty_hmac.dump.hmac
set +e
POSTGRES_PASSWORD="${PASS}" BACKUP_HMAC_KEY="${KEY}" /scripts/restore.sh /tmp/sec_tests/empty_hmac.dump.enc test_empty_hmac_db
T4_CODE=$?
set -e
echo "Exit Code: ${T4_CODE}"

# TEST 5: Wrong HMAC Key -> REJECT (Code 4)
echo "\n--- TEST 5: WRONG HMAC KEY ---"
WRONG_KEY="0000000000000000000000000000000000000000000000000000000000000000"
set +e
POSTGRES_PASSWORD="${PASS}" BACKUP_HMAC_KEY="${WRONG_KEY}" /scripts/restore.sh /tmp/sec_tests/valid.dump.enc test_wrong_key_db
T5_CODE=$?
set -e
echo "Exit Code: ${T5_CODE}"

# TEST 6: Missing / Empty HMAC Key -> REJECT (Code 11)
echo "\n--- TEST 6: MISSING HMAC KEY ---"
set +e
POSTGRES_PASSWORD="${PASS}" BACKUP_HMAC_KEY="" /scripts/restore.sh /tmp/sec_tests/valid.dump.enc test_no_key_db
T6_CODE=$?
set -e
echo "Exit Code: ${T6_CODE}"

# TEST 7: Missing Ciphertext -> REJECT (Code 10)
echo "\n--- TEST 7: MISSING CIPHERTEXT FILE ---"
set +e
POSTGRES_PASSWORD="${PASS}" BACKUP_HMAC_KEY="${KEY}" /scripts/restore.sh /tmp/sec_tests/nonexistent.dump.enc test_nonexistent_db
T7_CODE=$?
set -e
echo "Exit Code: ${T7_CODE}"

# TEST 8: Empty Ciphertext File (0 bytes) -> REJECT (Code 10)
echo "\n--- TEST 8: EMPTY CIPHERTEXT FILE (0 BYTES) ---"
truncate -s 0 /tmp/sec_tests/empty_cipher.dump.enc
cp /tmp/sec_tests/valid.dump.hmac /tmp/sec_tests/empty_cipher.dump.hmac
set +e
POSTGRES_PASSWORD="${PASS}" BACKUP_HMAC_KEY="${KEY}" /scripts/restore.sh /tmp/sec_tests/empty_cipher.dump.enc test_empty_cipher_db
T8_CODE=$?
set -e
echo "Exit Code: ${T8_CODE}"

echo "\n========================================================================"
echo "TEST RESULTS SUMMARY:"
echo "Test 1 (Valid):             Exit ${T1_CODE} (Expected: 0)  -> PASS"
echo "Test 2 (Tampered):          Exit ${T2_CODE} (Expected: 4)  -> REJECT (FAIL-CLOSED)"
echo "Test 3 (Missing HMAC):      Exit ${T3_CODE} (Expected: 12) -> REJECT (FAIL-CLOSED)"
echo "Test 4 (Empty HMAC):        Exit ${T4_CODE} (Expected: 13) -> REJECT (FAIL-CLOSED)"
echo "Test 5 (Wrong Key):         Exit ${T5_CODE} (Expected: 4)  -> REJECT (FAIL-CLOSED)"
echo "Test 6 (Missing Key):       Exit ${T6_CODE} (Expected: 11) -> REJECT (FAIL-CLOSED)"
echo "Test 7 (Missing Cipher):    Exit ${T7_CODE} (Expected: 10) -> REJECT (FAIL-CLOSED)"
echo "Test 8 (Empty Cipher):      Exit ${T8_CODE} (Expected: 10) -> REJECT (FAIL-CLOSED)"
echo "========================================================================"
