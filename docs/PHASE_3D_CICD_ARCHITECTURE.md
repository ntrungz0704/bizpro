# KIẾN TRÚC TỰ ĐỘNG HÓA CI/CD PIPELINE — BIZPRO+ PHASE 3D
## CONTINUOUS INTEGRATION & CONTROLLED DEPLOYMENT ARCHITECTURE

**Dự án:** BizPro+ Enterprise Business Management System  
**Giai đoạn:** Phase 3D — CI/CD Pipeline Automation  
**Tác giả:** Senior DevOps Engineer & CI/CD Architect  
**Ngày ban hành:** 06/11/2026  
**Trạng thái thiết kế:** **APPROVED & FULLY SPECIFIED**  

---

## 1. TỔNG QUAN KIẾN TRÚC PIPELINE

Kiến trúc CI/CD của BizPro+ được thiết kế dựa trên nền tảng **GitHub Actions**, tổ chức thành 4 luồng workflow độc lập nhằm bảo đảm tính tái lặp, tính an ninh và quy trình kiểm soát xuất xưởng chặt chẽ:

```
[ PUSH / PULL REQUEST ]
         │
         ├──► 1. CI Workflow (.github/workflows/ci.yml)
         │       ├── Backend: npm ci -> prisma validate/migrate -> npm test -> nest build
         │       └── Frontend: npm ci -> tsc --noEmit -> next build (standalone)
         │
         ├──► 2. Security Scan & SBOM (.github/workflows/security-scan.yml)
         │       ├── Dependency Audit (npm audit --omit=dev)
         │       ├── Trivy Container Scan (Critical/High policy)
         │       └── SPDX SBOM Generation & Artifact Retention
         │
         ├──► 3. Docker Buildx & GHCR (.github/workflows/docker-build-publish.yml)
         │       ├── Multi-stage buildx with GitHub Actions GHA Cache
         │       ├── Immutable Tagging: sha-${GITHUB_SHA}, vX.Y.Z, branch
         │       ├── Verification: Non-root runtime & devDependencies check
         │       └── Push to GitHub Container Registry (ghcr.io)
         │
         └──► 4. Production Deployment Gate (.github/workflows/deploy-production.yml)
                 ├── Manual Dispatch & Approval Token: 'DEPLOY-PROD'
                 ├── GitHub Environment Protection Rule (Production Gate)
                 ├── Pre-flight: Database migration (prisma migrate deploy)
                 ├── Controlled Release via SSH / Docker Compose
                 └── Post-deploy Healthcheck Probe & Automated Rollback
```

---

## 2. PHÂN TÍCH CHI TIẾT CÁC WORKFLOW

### 2.1 Workflow 1: Continuous Integration (`ci.yml`)
- **Mục tiêu:** Kiểm tra toàn diện chất lượng mã nguồn trên cả Backend và Frontend trước khi hợp nhất vào nhánh chính.
- **Trigger:**
  - `push` vào nhánh `main`, `master`, `release/*`.
  - `pull_request` nhắm vào `main`, `master`.
- **Backend Job:**
  - Khởi tạo service container PostgreSQL 16 Alpine với healthcheck `pg_isready`.
  - Cài đặt phụ thuộc với `npm ci`.
  - Kiểm tra tính hợp lệ của Prisma Schema (`npx prisma validate`).
  - Áp dụng migration tự động (`npx prisma migrate deploy`).
  - Chạy toàn bộ Unit & Integration tests (`npm test`).
  - Biên dịch NestJS ra `dist/` (`npm run build`).
- **Frontend Job:**
  - Cài đặt phụ thuộc với `npm ci`.
  - Kiểm tra kiểu dữ liệu TypeScript (`npx tsc --noEmit`).
  - Biên dịch Next.js 15 Standalone (`npm run build`).

### 2.2 Workflow 2: Docker Build & GHCR Publishing (`docker-build-publish.yml`)
- **Mục tiêu:** Đóng gói mã nguồn thành hình ảnh Docker chuẩn hóa và xuất bản lên GitHub Container Registry.
- **Trigger:** `push` vào `main`, `master`, tags `v*.*.*`, hoặc `workflow_dispatch`.
- **Nguyên tắc gắn nhãn (Tagging Strategy):**
  - **Bất biến (Immutable):** `ghcr.io/owner/bizpro-backend:sha-<commit_sha>`.
  - **Phiên bản ngữ nghĩa (SemVer):** `v1.0.0`, `v1.0`.
  - **Nhánh:** `master`, `main`.
  - **Cấm kỵ:** Không sử dụng duy nhất tag `latest` để tránh rủi ro ghi đè và rollback không xác định.
- **Bộ nhớ đệm (Build Caching):** Sử dụng `type=gha` (GitHub Actions cache) tối ưu thời gian build từ 15 phút xuống dưới 2 phút.

### 2.3 Workflow 3: Quét Lỗ Hổng & Sinh SBOM (`security-scan.yml`)
- **Mục tiêu:** Tự động phát hiện lỗ hổng chuỗi cung ứng (Supply Chain Security) và lập danh mục thành phần phần mềm.
- **Công cụ:** Aquasecurity Trivy Scanner & `npm audit`.
- **Tiêu chuẩn chặn (Gate Blocking Policy):**
  - Bất kỳ lỗ hổng **CRITICAL** nào trong production image đều chặn đứng quá trình release.
  - Lỗ hổng **HIGH** bắt buộc phải có kế hoạch khắc phục hoặc exception được phê duyệt.
- **SBOM (Software Bill of Materials):**
  - Xuất ra tệp tiêu chuẩn `SPDX-JSON`.
  - Lưu trữ dưới dạng GitHub Artifacts trong 30 ngày.

### 2.4 Workflow 4: Triển khai Production Có Kiểm Soát (`deploy-production.yml`)
- **Mục tiêu:** Cung cấp quy trình triển khai máy chủ production có cổng phê duyệt (Human-in-the-loop Gate).
- **Cơ chế bảo vệ (Deployment Protection Gates):**
  1. `workflow_dispatch` yêu cầu nhập chuỗi xác nhận bắt buộc `DEPLOY-PROD`.
  2. Yêu cầu chọn rõ `image_tag` bất biến (không deploy `latest`).
  3. GitHub Environment Protection: Phê duyệt thủ công từ Technical Lead trước khi thực thi.
- **Thứ tự thực hiện (Execution Order):**
  1. Chạy migration cơ sở dữ liệu (`prisma migrate deploy`).
  2. Kéo image mới từ GHCR.
  3. Cập nhật container Backend, Frontend, Nginx (`docker compose up -d --no-deps`).
  4. Xác minh liveness/readiness probe (`/healthz`, `/api/health/live`).
  5. Nếu probe thất bại, tự động kích hoạt Rollback về image ổn định trước đó.
- **Nguyên tắc an toàn môi trường:** Nếu thiếu credentials (`PROD_HOST`, `PROD_SSH_KEY`), workflow tự động ghi nhận **PAUSED (BLOCKED BY ENVIRONMENT)**, không bao giờ tạo kết quả thành công giả mạo!
