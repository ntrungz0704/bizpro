#!/bin/sh
# ==============================================================================
# BIZPRO+ PRODUCTION CUTOVER KIT: AUTOMATED TLS PROVISIONING (OPS-02)
# Features: DNS Preflight, Certbot / Let's Encrypt Integration, Safe Rollback,
# Nginx Configuration Validation (`nginx -t`), Automated Renewal Hooks
# ==============================================================================

set -eu

DRY_RUN=0
STAGING=0
DOMAIN="${DOMAIN_NAME:-}"
EMAIL="${LETSENCRYPT_EMAIL:-admin@bizpro.vn}"
NGINX_CONF_DIR="${NGINX_CONF_DIR:-/etc/nginx/conf.d}"
WEBROOT_DIR="${CERTBOT_WEBROOT:-/var/www/certbot}"

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --staging)
      STAGING=1
      shift
      ;;
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --email)
      EMAIL="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --dry-run       Validate DNS, domain and configuration without issuing live certificates"
      echo "  --staging       Use Let's Encrypt Staging API (avoid rate limits during testing)"
      echo "  --domain <fqdn> Specify production domain name (e.g. app.bizpro.vn)"
      echo "  --email <email> Email for certificate expiration notices"
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "{\"timestamp\":\"${TIMESTAMP}\",\"event\":\"tls_provisioning_started\",\"dry_run\":${DRY_RUN},\"staging\":${STAGING}}"

# ------------------------------------------------------------------------------
# 1. DOMAIN & DNS PREFLIGHT (FAIL-CLOSED)
# ------------------------------------------------------------------------------
if [ -z "${DOMAIN}" ]; then
  echo "=================================================================" >&2
  echo "[OPS-02 BLOCKED BY ENVIRONMENT] Production Domain Name Not Configured" >&2
  echo "Resolution: Supply production domain via DOMAIN_NAME env or --domain flag." >&2
  echo "Example: export DOMAIN_NAME=app.bizpro.vn && $0 --dry-run" >&2
  echo "=================================================================" >&2
  echo "{\"timestamp\":\"${TIMESTAMP}\",\"event\":\"tls_provisioning_blocked\",\"status\":\"BLOCKED_BY_ENVIRONMENT\",\"exit_code\":2}"
  exit 2
fi

echo "Performing DNS preflight check for domain: ${DOMAIN}..."

# Check DNS resolution via nslookup, host, or getent
DNS_IP=""
if command -v nslookup >/dev/null 2>&1; then
  DNS_IP=$(nslookup "${DOMAIN}" 2>/dev/null | awk '/^Address: / { print $2 }' | tail -n 1 || true)
elif command -v getent >/dev/null 2>&1; then
  DNS_IP=$(getent hosts "${DOMAIN}" | awk '{ print $1 }' || true)
fi

if [ -z "${DNS_IP}" ]; then
  echo "=================================================================" >&2
  echo "[OPS-02 BLOCKED BY ENVIRONMENT] DNS Resolution Failed for '${DOMAIN}'" >&2
  echo "Domain has no public DNS A/AAAA record pointing to this host." >&2
  echo "Let's Encrypt ACME challenge will fail without valid DNS delegation." >&2
  echo "Resolution: Configure DNS A record at your registrar before cutover." >&2
  echo "=================================================================" >&2
  echo "{\"timestamp\":\"${TIMESTAMP}\",\"event\":\"dns_resolution_failed\",\"domain\":\"${DOMAIN}\",\"status\":\"BLOCKED_BY_ENVIRONMENT\",\"exit_code\":3}"
  exit 3
fi

# Reject localhost/private IPs for live public Let's Encrypt
case "${DNS_IP}" in
  127.*|10.*|172.1[6-9].*|172.2[0-9].*|172.3[0-1].*|192.168.*|::1)
    if [ "${STAGING}" -eq 0 ] && [ "${DRY_RUN}" -eq 0 ]; then
      echo "ERROR: [OPS-02] Domain ${DOMAIN} resolves to private IP (${DNS_IP}). Public Let's Encrypt requires a routable public IP." >&2
      exit 3
    fi
    ;;
esac

echo "DNS preflight PASSED: ${DOMAIN} resolves to ${DNS_IP}."

if [ "${DRY_RUN}" -eq 1 ]; then
  echo "{\"timestamp\":\"${TIMESTAMP}\",\"event\":\"tls_dry_run_success\",\"domain\":\"${DOMAIN}\",\"resolved_ip\":\"${DNS_IP}\",\"status\":\"READY_FOR_CUTOVER\"}"
  exit 0
fi

# ------------------------------------------------------------------------------
# 2. ACME CHALLENGE & CERTBOT EXECUTION
# ------------------------------------------------------------------------------
mkdir -p "${WEBROOT_DIR}/.well-known/acme-challenge"

CERTBOT_ARGS="certonly --webroot -w ${WEBROOT_DIR} -d ${DOMAIN} --email ${EMAIL} --agree-tos --non-interactive"
if [ "${STAGING}" -eq 1 ]; then
  CERTBOT_ARGS="${CERTBOT_ARGS} --staging"
fi

if ! command -v certbot >/dev/null 2>&1; then
  echo "ERROR: [OPS-02] 'certbot' utility is not installed on host." >&2
  exit 1
fi

echo "Requesting TLS certificate from Let's Encrypt via Certbot..."
set +e
certbot ${CERTBOT_ARGS}
CERTBOT_STATUS=$?
set -e

if [ ${CERTBOT_STATUS} -ne 0 ]; then
  echo "ERROR: [OPS-02] Certbot certificate acquisition failed." >&2
  exit 4
fi

# ------------------------------------------------------------------------------
# 3. BACKUP CURRENT NGINX CONFIGURATION FOR SAFE ROLLBACK
# ------------------------------------------------------------------------------
DEFAULT_CONF="${NGINX_CONF_DIR}/default.conf"
BACKUP_CONF="${DEFAULT_CONF}.bak_$(date +%s)"
if [ -f "${DEFAULT_CONF}" ]; then
  cp "${DEFAULT_CONF}" "${BACKUP_CONF}"
fi

# ------------------------------------------------------------------------------
# 4. GENERATE ENFORCED HTTPS NGINX CONFIGURATION
# ------------------------------------------------------------------------------
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
KEY_PATH="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"

cat <<EOF > "${DEFAULT_CONF}"
# HTTP -> HTTPS Redirect
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root ${WEBROOT_DIR};
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

# Production HTTPS Reverse Proxy
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate ${CERT_PATH};
    ssl_certificate_key ${KEY_PATH};

    # Mozilla Modern SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # Security Headers (HSTS, Anti-Clickjacking, XSS)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    client_max_body_size 25M;

    # Internal Prometheus Metrics Endpoint (Forbidden externally)
    location = /api/metrics {
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        allow 172.16.0.0/12;
        allow 192.168.0.0/16;
        deny all;

        proxy_pass http://backend:4000;
    }

    # API Routing
    location /api/ {
        proxy_pass http://backend:4000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # Frontend UI Routing
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
EOF

# ------------------------------------------------------------------------------
# 5. VALIDATE NGINX CONFIGURATION & SAFE ROLLBACK
# ------------------------------------------------------------------------------
echo "Validating generated Nginx TLS configuration syntax..."
set +e
nginx -t 2>/dev/null
NGINX_TEST_STATUS=$?
set -e

if [ ${NGINX_TEST_STATUS} -ne 0 ]; then
  echo "CRITICAL: Nginx syntax test failed! Rolling back to previous configuration..." >&2
  if [ -f "${BACKUP_CONF}" ]; then
    cp "${BACKUP_CONF}" "${DEFAULT_CONF}"
    rm -f "${BACKUP_CONF}"
  fi
  echo "Rollback completed. Service uninterrupted." >&2
  exit 5
fi

# Reload Nginx
nginx -s reload
rm -f "${BACKUP_CONF}"

echo "Nginx reloaded successfully with active Let's Encrypt TLS certificate."
echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"event\":\"tls_provisioned\",\"domain\":\"${DOMAIN}\",\"status\":\"PASS\"}"
exit 0
