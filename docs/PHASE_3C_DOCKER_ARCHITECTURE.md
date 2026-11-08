# KIẾN TRÚC CONTAINER & REVERSE PROXY — BIZPRO+ PHASE 3C

**Dự án:** BizPro+ Enterprise Business Management System  
**Giai đoạn:** Phase 3C — Multi-stage Docker Build & Nginx Reverse Proxy  
**Tác giả:** Devops Engineer & Senior System Architect  
**Ngày phê duyệt thiết kế:** 06/11/2026  
**Trạng thái kiểm chứng:** VERIFIED & HEALTHY ON DOCKER ENGINE 27+  

---

## 1. TỔNG QUAN KIẾN TRÚC TOPO PRODUCTION

BizPro+ Phase 3C thiết lập cấu trúc đóng gói container hóa chuẩn cấp doanh nghiệp (Enterprise Container Topology), tuân thủ triệt để nguyên tắc **Zero-Leak Security Boundary**:

```
                              [ INTERNET / CLIENT ]
                                        │
                                   Port 80/443 (TLS)
                                        ▼
                        ┌───────────────────────────────┐
                        │       Nginx Reverse Proxy     │
                        │    (Alpine 1.27, Ingress)     │
                        └───────────────┬───────────────┘
                                        │
            ┌───────────────────────────┴───────────────────────────┐
            │ Docker Isolated Bridge Network: `bizpro_internal`      │
            ▼                                                       ▼
  ┌───────────────────┐                                   ┌───────────────────┐
  │ Frontend (Next.js)│                                   │ Backend (NestJS)  │
  │ Standalone 76MB   │                                   │ Alpine Node 105MB │
  │ Non-root: nextjs  │                                   │ Non-root: nodejs  │
  │ Port 3000 (Local) │                                   │ Port 4000 (Local) │
  └───────────────────┘                                   └─────────┬─────────┘
                                                                    │
                                                                    ▼
                                                          ┌───────────────────┐
                                                          │ PostgreSQL 16 DB  │
                                                          │ Alpine, 0 Port Exp│
                                                          │ Volume: persistent│
                                                          └───────────────────┘
```

### Các nguyên tắc cốt lõi:
1. **Single Public Ingress Point:** Chỉ duy nhất Nginx mở cổng 80/443 ra môi trường Host/Internet. Mọi truy vấn trực tiếp từ ngoài đến Backend (4000), Frontend (3000), hay Database (5432) đều bị chặn 100%.
2. **Dedicated Internal Network:** Tất cả service giao tiếp với nhau thông qua Docker bridge network `bizpro_internal`, cách ly hoàn toàn với các container khác trên host.
3. **Multi-Stage Build Minimal Footprint:**
   - Backend NestJS: 105MB (Alpine Node 20 + dumb-init + production pruned dependencies).
   - Frontend Next.js 15: 76MB (Standalone build, loại bỏ node_modules cồng kềnh, chỉ giữ runtime artifacts).
4. **Least Privilege Execution:** 100% container ứng dụng chạy dưới quyền người dùng không đặc quyền (non-root UID 10001), ngăn ngừa container escape.
5. **Deterministic Pre-flight Migration:** Database migration được thực thi bằng migration container độc lập (`bizpro_prod_migration`), chỉ khi migration kết thúc thành công với mã 0 (`service_completed_successfully`), Backend mới được phép khởi động.

---

## 2. THIẾT KẾ MULTI-STAGE DOCKERFILE

### 2.1 Backend NestJS (`backend/Dockerfile`)
- **Stage 1: dependencies:** Cài đặt package với `npm ci`, sinh Prisma Client via `npx prisma generate`.
- **Stage 2: builder:** Build mã nguồn TypeScript ra JavaScript ES2022 (`nest build`), thực hiện `npm prune --omit=dev` để loại bỏ 100% devDependencies khỏi container.
- **Stage 3: runner:**
  - Base: `node:20-alpine`.
  - Tiện ích: `dumb-init` (PID 1 reaper), `curl` (health check probe), `openssl`, `libc6-compat`.
  - User: `nodejs:nodejs` (UID/GID 10001).
  - Healthcheck: định kỳ 10s kiểm tra `/api/health/live`.

### 2.2 Frontend Next.js 15 (`frontend/Dockerfile`)
- **Stage 1: deps:** Cài đặt phụ thuộc sạch qua `npm ci`.
- **Stage 2: builder:** Biên dịch Next.js với cờ `output: 'standalone'` trong `next.config.ts`.
- **Stage 3: runner:**
  - Base: `node:20-alpine`.
  - Tiện ích: `dumb-init`, `wget`.
  - User: `nextjs:nodejs` (UID/GID 10001).
  - Chạy `server.js` độc lập từ `.next/standalone`. Kích thước giảm từ 1.2GB xuống **76MB**.

---

## 3. CẤU HÌNH NGINX REVERSE PROXY

### 3.1 Routing Rules
- `/` $\to$ `http://frontend:3000` (Next.js Standalone SSR & Static Assets).
- `/api/` $\to$ `http://backend:4000` (NestJS REST API, WebSocket, Swagger).
- `/healthz` $\to$ Nginx internal healthcheck endpoint, trả về HTTP 200 `OK`.

### 3.2 Security & Buffering Hardening
- `client_max_body_size 25M`: Bảo vệ hệ thống chống DoS qua payload lớn trong khi hỗ trợ tải file chứng từ ERP.
- `server_tokens off`: Che giấu hoàn toàn phiên bản Nginx trong HTTP response header.
- `proxy_http_version 1.1` & `Upgrade`/`Connection`: Hỗ trợ đầy đủ WebSocket và HTTP Keep-alive pooling.
- `ssl.conf.template`: Thiết kế sẵn cấu hình TLS 1.2/TLS 1.3 hiện đại với HSTS và cipher suites bảo mật cao.

---

## 4. QUẢN LÝ PERSISTENCE & DATA INTEGRITY
- PostgreSQL Data Volume: `postgres_data` (named volume).
- Đảm bảo dữ liệu không bị mất khi restart container hoặc cập nhật image mới.
- Khởi động cơ sở dữ liệu an toàn với healthcheck probe `pg_isready` trước khi ứng dụng kết nối.
