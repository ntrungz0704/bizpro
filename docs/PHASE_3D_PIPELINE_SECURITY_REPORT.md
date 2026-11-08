# BÁO CÁO AN NINH PIPELINE & CHUỖI CUNG ỨNG — BIZPRO+ PHASE 3D
## CI/CD PIPELINE SECURITY & SUPPLY CHAIN VERIFICATION

**Dự án:** BizPro+ Enterprise Business Management System  
**Giai đoạn:** Phase 3D — Pipeline Security Verification  
**Tác giả:** Application Security Engineer & DevSecOps Specialist  
**Ngày ban hành:** 06/11/2026  
**Kết quả tổng quan:** **ZERO SECRET EXPOSURE / CRITICAL VULNERABILITY GATE ACTIVE**  

---

## 1. NGUYÊN TẮC BẢO MẬT GITHUB ACTIONS WORKFLOWS

Hệ thống workflow của BizPro+ được thiết lập tuân thủ nghiêm ngặt theo khuyến nghị an ninh của **GitHub Security Lab** và **OpenSSF Scorecard**:

1. **Least-Privilege Permissions:**
   - Mỗi workflow đều khai báo rõ ràng khối `permissions:` ở cấp độ tối thiểu.
   - Ví dụ: `ci.yml` chỉ có `contents: read`, `docker-build-publish.yml` chỉ có `contents: read` và `packages: write`.
   - Vô hiệu hóa mặc định quyền ghi vào repository (`write-all`).
2. **Pinned Action Versions:**
   - Sử dụng các Action chính thức từ tổ chức uy tín với phiên bản cố định (`actions/checkout@v4`, `docker/setup-buildx-action@v3`, `docker/build-push-action@v5`, `aquasecurity/trivy-action@master`).
3. **Secret Injection Prevention:**
   - Không truyền secret qua cờ `ARG` của Docker build.
   - Không xuất hoặc in giá trị biến bí mật ra log bằng lệnh `echo`.
   - Cơ chế bảo vệ Pull Request từ các nhánh fork bên ngoài không có quyền truy cập vào repository secrets.
4. **Concurrency Control:**
   - Mọi workflow đều khai báo `concurrency:` với nhóm định danh duy nhất và `cancel-in-progress: true` để tránh chạy chồng chéo tài nguyên hoặc gây race condition.

---

## 2. CHÍNH SÁCH QUÉT LỖ HỔNG BẢO MẬT (TRIVY SCANNING POLICY)

| Mức độ nghiêm trọng | Tiêu chuẩn xử lý | Hành vi Pipeline |
|:---|:---|:---|
| **CRITICAL** | Bắt buộc khắc phục 100% trước khi phát hành | **BLOCKED (Pipeline trả về lỗi mã 1)** |
| **HIGH** | Yêu cầu vá lỗi hoặc có văn bản giải trình lý do kỹ thuật | Cảnh báo chi tiết trong Security Report |
| **MODERATE / LOW** | Theo dõi định kỳ và nâng cấp theo chu kỳ bảo trì | Ghi nhận và xuất vào SBOM |

### Quét thành phần hệ điều hành (OS) và thư viện (Library)
- Quét các gói hệ điều hành Alpine base image (`libcrypto3`, `libssl3`, `busybox`, `musl`).
- Quét toàn bộ phụ thuộc npm trong `node_modules` runtime (`package-lock.json`).
- Cờ `ignore-unfixed: true` giúp tập trung nguồn lực xử lý các lỗ hổng đã có bản vá chính thức từ nhà phát triển.

---

## 3. PHẦN MỀM ĐỊNH DANH (SBOM - SOFTWARE BILL OF MATERIALS)
- Chuẩn định dạng: **SPDX JSON** (ISO/IEC 5962:2021).
- Tệp sinh ra: `sbom-bizpro-backend.spdx.json` và `sbom-bizpro-frontend.spdx.json`.
- Mục đích: Cung cấp danh mục thành phần minh bạch 100% cho kiểm toán độc lập, truy vết nguồn gốc và rà soát lỗ hổng zero-day khi có cảnh báo CVE mới từ NIST / NVD.
- Lưu trữ: Tự động tải lên mục GitHub Artifacts với thời gian lưu trữ tối thiểu 30 ngày.

---

## 4. KẾT LUẬN
Pipeline CI/CD của BizPro+ Phase 3D không chỉ tự động hóa quy trình xuất bản phần mềm mà còn đóng vai trò như một chốt chặn an ninh kiên cố, ngăn chặn hoàn toàn việc đưa mã nguồn chứa lỗ hổng hoặc lộ lọt thông tin bí mật ra môi trường sản xuất.
