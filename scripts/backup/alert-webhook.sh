#!/bin/sh
# ==============================================================================
# BIZPRO+ PROVIDER-AGNOSTIC ALERT WEBHOOK — PHASE 3F (FINAL RECONCILED)
# Standards: Explicit Retry Loop (2 retries, 1s delay), HTTP Status Classification,
# Structured Telemetry Logging, Zero Crash on Failure (Non-blocking)
# ==============================================================================

set -eu

EVENT_TYPE="${1:-INFO}"
MESSAGE="${2:-No message specified}"
ALERT_WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"

TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# If webhook URL is unconfigured, report SKIPPED (Never falsely claim DELIVERED)
if [ -z "${ALERT_WEBHOOK_URL}" ]; then
  echo "{\"timestamp\":\"${TIMESTAMP}\",\"event\":\"alert_skipped\",\"status\":\"NOT_CONFIGURED\",\"type\":\"${EVENT_TYPE}\"}"
  exit 0
fi

# Build provider-agnostic JSON payload
PAYLOAD=$(cat <<EOF
{
  "project": "BizPro+",
  "environment": "production",
  "event_type": "${EVENT_TYPE}",
  "message": "${MESSAGE}",
  "timestamp": "${TIMESTAMP}"
}
EOF
)

# Explicit retry configuration
MAX_RETRIES=2
RETRY_DELAY=1
ATTEMPT=1
TOTAL_ATTEMPTS=$((MAX_RETRIES + 1))
DELIVERED=0
FINAL_HTTP_CODE="000"

while [ "${ATTEMPT}" -le "${TOTAL_ATTEMPTS}" ]; do
  NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  
  # Execute curl and capture exact HTTP code
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
       -X POST -H "Content-Type: application/json" \
       -d "${PAYLOAD}" \
       --max-time 5 \
       "${ALERT_WEBHOOK_URL}" 2>/dev/null || echo "000")
  
  FINAL_HTTP_CODE="${HTTP_CODE}"

  if [ "${HTTP_CODE}" -ge 200 ] 2>/dev/null && [ "${HTTP_CODE}" -lt 300 ] 2>/dev/null; then
    DELIVERED=1
    echo "{\"timestamp\":\"${NOW}\",\"event\":\"alert_attempt\",\"attempt\":${ATTEMPT},\"status\":\"SUCCESS\",\"http_code\":${HTTP_CODE}}"
    break
  else
    echo "{\"timestamp\":\"${NOW}\",\"event\":\"alert_attempt\",\"attempt\":${ATTEMPT},\"status\":\"FAILED\",\"http_code\":${HTTP_CODE}}" >&2
    if [ "${ATTEMPT}" -lt "${TOTAL_ATTEMPTS}" ]; then
      sleep "${RETRY_DELAY}"
    fi
  fi

  ATTEMPT=$((ATTEMPT + 1))
done

END_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

if [ "${DELIVERED}" -eq 1 ]; then
  echo "{\"timestamp\":\"${END_TIMESTAMP}\",\"event\":\"alert_delivered\",\"status\":\"DELIVERED\",\"http_code\":${FINAL_HTTP_CODE},\"attempts\":${ATTEMPT},\"type\":\"${EVENT_TYPE}\"}"
  exit 0
else
  echo "{\"timestamp\":\"${END_TIMESTAMP}\",\"event\":\"alert_delivery_failed\",\"status\":\"FAILED\",\"http_code\":${FINAL_HTTP_CODE},\"attempts_exhausted\":${MAX_RETRIES},\"total_attempts\":$((ATTEMPT - 1)),\"type\":\"${EVENT_TYPE}\"}" >&2
  exit 5
fi
