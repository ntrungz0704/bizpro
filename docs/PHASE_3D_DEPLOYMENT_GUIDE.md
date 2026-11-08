# HƯỚNG DẪN TRIỂN KHAI & CẤU HÌNH CI/CD — BIZPRO+ PHASE 3D
## CI/CD OPERATIONS & SECRETS CONFIGURATION MANUAL

**Dự án:** BizPro+ Enterprise Business Management System  
**Giai đoạn:** Phase 3D  
**Ngày ban hành:** 06/11/2026  
**Mục tiêu:** Hướng dẫn kỹ sư vận hành cấu hình GitHub Secrets, duyệt gate triển khai và thực hiện quy trình rollback.

---

## 1. CẤU HÌNH GITHUB REPOSITORY SECRETS

Để kích hoạt luồng xuất bản hình ảnh lên GitHub Container Registry (GHCR) và quy trình triển khai máy chủ production, quản trị viên cần truy cập vào mục **Settings $\to$ Secrets and variables $\to$ Actions** trên GitHub repository và thiết lập các biến sau:

| Tên Secret | Bắt buộc | Mô tả & Định dạng giá trị |
|:---|:---:|:---|
| `GITHUB_TOKEN` | Tự động | Do GitHub Actions tự sinh, đã được cấp quyền `packages: write` để đẩy image lên GHCR. |
| `PROD_HOST` | Tùy chọn | Địa chỉ IP hoặc tên miền FQDN của máy chủ Production (ví dụ: `app.bizpro.vn`). |
| `PROD_USER` | Tùy chọn | Tên người dùng SSH trên máy chủ (ví dụ: `deployer` hoặc `ubuntu`). |
| `PROD_SSH_KEY` | Tùy chọn | Khóa SSH Private Key (chuẩn Ed25519 hoặc RSA 4096-bit) để xác thực không cần mật khẩu. |
| `PROD_DATABASE_URL` | Tùy chọn | Chuỗi kết nối PostgreSQL Production phục vụ lệnh `prisma migrate deploy`. |

*Ghi chú quan trọng:* Nếu chưa cấu hình `PROD_HOST` và `PROD_SSH_KEY`, workflow triển khai sẽ tự động nhận diện và chuyển sang trạng thái tạm dừng an toàn (`BLOCKED BY ENVIRONMENT`), không gây lỗi pipeline.

---

## 2. QUY TRÌNH DUYỆT CỔNG TRIỂN KHAI (DEPLOYMENT GATE WORKFLOW)

Khi phát hành một phiên bản mới lên môi trường Production:

1. **Bước 1: Chọn phiên bản hình ảnh:**
   - Vào tab **Actions** $\to$ Chọn workflow **BizPro+ Production Deployment (Controlled Gate)** $\to$ Bấm **Run workflow**.
   - Nhập `image_tag`: Tag bất biến đã sinh từ workflow Docker Build (ví dụ: `sha-a1b2c3d4e5f6` hoặc `v1.0.0`).
2. **Bước 2: Xác nhận phê duyệt (Human Confirmation Token):**
   - Trong ô `confirm_production`, nhập chính xác chuỗi: `DEPLOY-PROD`.
   - Nếu nhập sai hoặc để trống, job `pre-flight-check` sẽ lập tức hủy bỏ luồng triển khai.
3. **Bước 3: Phê duyệt môi trường GitHub Environment:**
   - Người có thẩm quyền (Tech Lead / DevOps Lead) sẽ nhận được thông báo yêu cầu **Review Deployments** trên GitHub.
   - Bấm **Approve and deploy** để cấp phép thực thi.
4. **Bước 4: Giám sát kiểm tra sau triển khai:**
   - Hệ thống tự động kiểm tra endpoint `/healthz` và `/api/health/live`. Nếu phản hồi HTTP 200 OK, phiên bản mới chính thức được ghi nhận thành công.

---

## 3. QUY TRÌNH ROLLBACK KHẨN CẤP (EMERGENCY ROLLBACK)

Trong trường hợp release mới gặp sự cố logic nghiệp vụ hoặc không vượt qua được healthcheck:

### Cách 1: Rollback tự động qua Pipeline
Workflow `deploy-production.yml` đã được lập trình sẵn khối `Automated Failure Reporting & Rollback Trigger`. Khi lệnh deploy hoặc healthcheck trả về mã lỗi khác 0, pipeline sẽ tự động gọi lệnh khôi phục về container trước đó.

### Cách 2: Rollback thủ công bằng tag bất biến qua GitHub Actions
1. Vào tab **Actions** $\to$ Chạy lại workflow **BizPro+ Production Deployment**.
2. Nhập `image_tag` của bản phát hành ổn định liền trước (ví dụ: `sha-prev-commit-hash`).
3. Xác nhận `DEPLOY-PROD` và phê duyệt. Hệ thống sẽ kéo image cũ về và khởi động lại dịch vụ trong vòng dưới 30 giây mà không cần can thiệp SSH thủ công.

---

## 4. QUẢN LÝ DATABASE MIGRATION TRONG CI/CD
- **Nguyên tắc bất biến:** Không bao giờ chạy `prisma migrate reset` trên môi trường Production!
- Lệnh được sử dụng trong pipeline là `npx prisma migrate deploy`, chỉ áp dụng các migration mới chưa được chạy và tuyệt đối không làm mất dữ liệu hiện có.
- Nếu migration thất bại, pipeline sẽ dừng lại ngay lập tức tại bước migration pre-flight, ngăn chặn Backend image mới được triển khai.
