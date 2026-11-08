# BIZPRO+ PHASE 3E: OBSERVABILITY ARCHITECTURE SPECIFICATION

**Project:** BizPro+ Integrated Modular Business Management System  
**Phase:** 3E — Backup, Disaster Recovery & Observability  
**Standard Compliance:** Prometheus OpenMetrics Standards & Cloud Native Logging  
**Status:** IMPLEMENTED & VERIFIED  

---

## 1. Observability Overview

The BizPro+ Phase 3E Observability Architecture provides unified visibility across the runtime topology through three primary pillars:
1. **Metrics Collection:** Prometheus pull-based exporter at `/api/metrics` with standard gauge/counter formatting.
2. **Access Ingress Restriction:** Nginx reverse proxy level enforcement restricting `/api/metrics` to internal monitoring subnets and localhost only.
3. **Structured JSON Logging with Redaction:** Interceptors sanitizing sensitive fields (passwords, tokens, keys) across all log outputs.
4. **Multi-level Health Probes:** Container and application-level liveness (`/api/health/live`) and readiness (`/api/health/ready`) probes.

---

## 2. Prometheus Exporter Specification

### Endpoint: `GET /api/metrics`
- **Output Format:** Plaintext OpenMetrics format (`Content-Type: text/plain; version=0.0.4; charset=utf-8`).
- **Cache Strategy:** `no-cache, no-store, must-revalidate`.
- **Response Transformation:** Bypassed via `@SetMetadata(BYPASS_TRANSFORM_KEY, true)` to ensure standard Prometheus scraper compatibility.

### Metric Catalog Exposed:
```text
# HELP bizpro_uptime_seconds Process uptime in seconds
# TYPE bizpro_uptime_seconds gauge
bizpro_uptime_seconds 12

# HELP bizpro_nodejs_heap_used_bytes Memory heap currently used in bytes
# TYPE bizpro_nodejs_heap_used_bytes gauge
bizpro_nodejs_heap_used_bytes 24445056

# HELP bizpro_nodejs_heap_total_bytes Memory heap allocated in bytes
# TYPE bizpro_nodejs_heap_total_bytes gauge
bizpro_nodejs_heap_total_bytes 26173440

# HELP bizpro_nodejs_rss_bytes Resident Set Size in bytes
# TYPE bizpro_nodejs_rss_bytes gauge
bizpro_nodejs_rss_bytes 102277120

# HELP bizpro_database_status Database connectivity (1 = connected, 0 = disconnected)
# TYPE bizpro_database_status gauge
bizpro_database_status 1

# HELP bizpro_database_latency_ms Database ping latency in milliseconds
# TYPE bizpro_database_latency_ms gauge
bizpro_database_latency_ms 1

# HELP bizpro_backup_subsystem_status Backup subsystem operational readiness (1 = ready)
# TYPE bizpro_backup_subsystem_status gauge
bizpro_backup_subsystem_status 1
```

---

## 3. Ingress Security & Public Access Restriction

To prevent reconnaissance and operational exposure, the Prometheus metrics endpoint is protected at the Nginx edge:

```nginx
# RESTRICTED: Prometheus Metrics Endpoint (Internal monitoring only, forbidden publicly)
location = /api/metrics {
    # Allow internal subnets & localhost, deny all external untrusted requests
    allow 127.0.0.1;
    allow 10.0.0.0/8;
    allow 172.16.0.0/12;
    allow 192.168.0.0/16;
    deny all;

    proxy_pass http://backend_upstream;
    proxy_http_version 1.1;
    proxy_hide_header X-Powered-By;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Verification:
- **Localhost Request (`127.0.0.1`):** `HTTP/1.1 200 OK` (Prometheus metrics returned).
- **Public / External Request (Non-whitelisted):** `HTTP/1.1 403 Forbidden` (`deny all` triggered at Nginx).

---

## 4. Structured Logging & Sensitive Data Redaction

All application interceptors enforce automated masking of sensitive parameters:
- `password`, `token`, `secret`, `accessToken`, `refreshToken`, `encryptionKey`, `authorization`.
- Redacted fields are replaced with `[REDACTED]` in all output streams.
- Log format complies with structured JSON schema including ISO 8601 timestamps, log level, event names, and tenant isolation identifiers.

---

## 5. Container & Application Health Probes

| Probe Type | Endpoint | Protocol | Interval | Timeout | Retries | Success Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend Liveness** | `/api/health/live` | HTTP GET | 10s | 5s | 3 | Process up, memory < 1GB |
| **Backend Readiness** | `/api/health/ready` | HTTP GET | 10s | 5s | 3 | Active PostgreSQL connection verified |
| **Frontend Health** | `http://frontend:3000/` | HTTP GET | 10s | 5s | 3 | HTTP 200 OK |
| **Nginx Health** | `http://localhost/healthz`| HTTP GET | 10s | 3s | 3 | Nginx worker responsive (`200 OK`) |
| **PostgreSQL Health**| `pg_isready -U bizpro_app`| CLI | 5s | 3s | 5 | PostgreSQL accepting connections |
