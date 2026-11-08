# BÁO CÁO PHÂN TÍCH LỖ HỔNG & KHOẢNG TRỐNG BẢO MẬT: PHASE 3A
## PHASE 3A — SECURITY GAP ANALYSIS REPORT

**Dự án:** BizPro+ Modular Enterprise ERP & Business Management System  
**Mã tài liệu:** `docs/PHASE_3A_SECURITY_GAP_ANALYSIS.md`  
**Ngày thực hiện:** 06/11/2026  
**Chuyên gia thực hiện:** Principal DevSecOps Engineer & Application Security Specialist  
**Kính gửi:** Senior Technical Lead & Code Auditor  
**Tiêu chuẩn đối chiếu:** OWASP Top 10 (2021), CIS PostgreSQL 16 Benchmark, NIST SP 800-53

---

## 1. PHƯƠNG PHÁP & PHẠM VI PHÂN TÍCH

Báo cáo phân tích bảo mật Phase 3A được thực hiện độc lập, không xâm nhập (Non-intrusive / Read-Only), dựa trên bằng chứng thu thập trực tiếp từ:
1. Phân tích mã nguồn tĩnh (SAST): Quét file cấu hình, decorators, guards, interceptors, và DTO validation.
2. Kiểm toán cơ sở dữ liệu (Database Security Review): Truy vấn hệ thống catalog PostgreSQL 16 (`pg_class`, `pg_roles`, `pg_policies`).
3. Kiểm toán chuỗi cung ứng phần mềm (Software Supply Chain Security): Thực thi `npm audit` trên cả Backend và Frontend.
4. Đánh giá cấu hình mạng & container (Container & Network Topology Audit): Kiểm tra `docker-compose.yml`, biến môi trường và port binding.

### Thang phân loại Mức độ Nghiêm trọng (Severity Classification)
- **CRITICAL:** Đe dọa trực tiếp đến tính bảo mật, tính toàn vẹn hoặc tính khả dụng của dữ liệu khách hàng; có thể khai thác từ xa không cần xác thực hoặc dẫn đến rò rỉ dữ liệu chéo tenant.
- **HIGH:** Lỗ hổng kỹ thuật hoặc rủi ro vận hành trọng yếu, làm suy yếu hàng rào phòng thủ chiều sâu (Defense-in-Depth), bắt buộc phải xử lý trước khi ra Production.
- **MEDIUM:** Điểm yếu kiến trúc hoặc cấu hình cần được khắc phục theo kế hoạch nâng cấp có kiểm soát.
- **LOW:** Các vấn đề nhỏ về chuẩn hóa mã nguồn hoặc tối ưu hóa hiệu năng.
- **INFORMATIONAL:** Ghi nhận thực tế kỹ thuật không tạo ra rủi ro trực tiếp.

---

## 2. BẢNG TỔNG HỢP CÁC KHOẢNG TRỐNG BẢO MẬT (FINDINGS MATRIX)

| Mã phát hiện | Hạng mục | Mức độ | Thành phần ảnh hưởng | Trạng thái xác minh | Chặn xuất xưởng |
|---|---|---|---|---|---|
| **SEC-GAP-01** | Secrets Mgmt | **CRITICAL** | `backend/src/config/env.validation.ts` | **CONFIRMED** | **YES** |
| **SEC-GAP-02** | Supply Chain | **HIGH** | `backend/package.json` (`tar <=7.5.20`) | **CONFIRMED** | **YES** |
| **SEC-GAP-03** | Supply Chain | **HIGH** | `frontend/package.json` (`next 15.1.0`) | **CONFIRMED** | **YES** |
| **SEC-GAP-04** | Network / DB | **HIGH** | `docker-compose.yml` (`bizpro_postgres`) | **CONFIRMED** | **YES** |
| **SEC-GAP-05** | HTTP Security | **HIGH** | `backend/src/main.ts` (Thiếu `helmet`) | **CONFIRMED** | **YES** |
| **SEC-GAP-06** | API Security | **MEDIUM** | `backend/src/main.ts` (Swagger công khai) | **CONFIRMED** | **NO** |
| **SEC-GAP-07** | Session Mgmt | **MEDIUM** | `backend/src/auth/auth.service.ts` | **CONFIRMED** | **NO** |
| **SEC-GAP-08** | Logging | **MEDIUM** | `backend/src/common/interceptors` | **CONFIRMED** | **NO** |
| **SEC-GAP-09** | CORS Policy | **LOW** | `backend/src/main.ts` | **CONFIRMED** | **NO** |

---

## 3. CHI TIẾT CÁC PHÁT HIỆN BẢO MẬT

### FINDING SEC-GAP-01: Khóa Bí Mật Mặc Định trong Validation Môi Trường (Fallback Secrets)
- **Mức độ:** **CRITICAL**
- **Thành phần ảnh hưởng:** `backend/src/config/env.validation.ts` (Dòng 38-51)
- **Bằng chứng mã nguồn:**
  ```typescript
  @IsString()
  @IsOptional()
  JWT_ACCESS_SECRET: string =
    'bizpro_access_secret_super_secure_key_change_in_production';

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET: string =
    'bizpro_refresh_secret_super_secure_key_change_in_production';

  @IsString()
  @IsOptional()
  AUTH_RESPONSE_ENVELOPE_KEY: string =
    'bizpro_aes_256_gcm_durable_secret_key_32b!';
  ```
- **Giải thích kỹ thuật:** Toàn bộ các khóa mã hóa đối xứng AES-256-GCM và khóa ký JWT được đánh dấu `@IsOptional()` và có giá trị fallback cố định. Nếu một máy chủ triển khai quên cung cấp biến môi trường hoặc file `.env` bị thiếu, hệ thống vẫn khởi động thành công và sử dụng các khóa công khai này.
- **Tác động nghiệp vụ:** Kẻ tấn công có thể tự tạo Access Token với role `SUPER_ADMIN` cho bất kỳ Tenant nào và truy cập trái phép toàn bộ dữ liệu tài chính, khách hàng và nhân sự.
- **Biện pháp khắc phục (Remediation):**
  1. Trong môi trường `production`, xóa bỏ hoàn toàn giá trị mặc định.
  2. Bắt buộc kiểm tra độ dài tối thiểu 32 ký tự ngẫu nhiên (256-bit entropy) cho cả ba biến.
  3. Quá trình bootstrap phải ném exception và dừng khởi động máy chủ ngay lập tức nếu thiếu các biến này.
- **Chặn xuất xưởng:** **BẮT BUỘC KHẮC PHỤC TRONG PHASE 3B**.

---

### FINDING SEC-GAP-02: Lỗ Hổng Nghiêm Trọng Chuỗi Cung Ứng Backend (tar <=7.5.20)
- **Mức độ:** **HIGH**
- **Thành phần ảnh hưởng:** `node_modules/tar` $\to$ `@mapbox/node-pre-gyp` $\to$ `bcrypt` $\to$ `backend/package.json`
- **Bằng chứng kiểm toán:** Kết quả `npm audit` ghi nhận mã cố vấn an ninh GitHub: `GHSA-34x7-hfp2-rc4v`, `GHSA-8qq5-rm4j-mr97`, `GHSA-83g3-92jg-28cx`.
- **Giải thích kỹ thuật:** Thư viện `tar` (phiên bản cũ đi kèm với công cụ build native `bcrypt`) dễ bị tấn công Arbitrary File Overwrite và Directory Traversal thông qua hardlink và symlink poisoning.
- **Tác động nghiệp vụ:** Kẻ tấn công nếu có thể kích hoạt tiến trình giải nén archive có thể ghi đè file nhạy cảm trên hệ điều hành máy chủ.
- **Biện pháp khắc phục:**
  1. Chạy `npm audit fix` hoặc cấu hình `overrides` trong `package.json` để ép buộc sử dụng phiên bản `tar` đã vá lỗi hoặc nâng cấp `bcrypt` lên bản mới không phụ thuộc `@mapbox/node-pre-gyp` cũ.
- **Chặn xuất xưởng:** **BẮT BUỘC KHẮC PHỤC TRONG PHASE 3B**.

---

### FINDING SEC-GAP-03: Lỗ Hổng Phiên Bản Framework Frontend (Next.js 15.1.0)
- **Mức độ:** **HIGH**
- **Thành phần ảnh hưởng:** `frontend/package.json`
- **Bằng chứng kiểm toán:** `npm audit` phát hiện phiên bản `next: 15.1.0` chứa các lỗ hổng đã công bố: `GHSA-7m27-7ghc-44w9` (Denial of Service qua Server Actions), `GHSA-9qr9-h5gf-34mp` (Flight protocol issues).
- **Tác động nghiệp vụ:** Nguy cơ làm sập tiến trình Node.js của frontend khi nhận các request Server Action giả mạo được tạo đặc biệt.
- **Biện pháp khắc phục:** Cập nhật phiên bản Next.js lên bản vá bảo mật mới nhất (`next@15.5.x` hoặc bản phát hành ổn định tương đương).
- **Chặn xuất xưởng:** **BẮT BUỘC KHẮC PHỤC TRONG PHASE 3B**.

---

### FINDING SEC-GAP-04: Lộ Cổng PostgreSQL và Thông Tin Superuser trong Docker Compose
- **Mức độ:** **HIGH**
- **Thành phần ảnh hưởng:** `docker-compose.yml`
- **Bằng chứng cấu hình:**
  ```yaml
  services:
    postgres:
      image: postgres:16-alpine
      ports:
        - "5432:5432"
      environment:
        POSTGRES_USER: bizpro_user
        POSTGRES_PASSWORD: bizpro_password
  ```
- **Giải thích kỹ thuật:**
  1. Port `5432` được bind trực tiếp ra host (`0.0.0.0:5432`), cho phép bất kỳ ai trong mạng nội bộ hoặc qua Internet (nếu máy chủ có Public IP mà không có firewall) quét thấy cổng database.
  2. Mật khẩu superuser `bizpro_user` đang dùng giá trị phổ thông `bizpro_password`.
- **Tác động nghiệp vụ:** Mở ra bề mặt tấn công brute-force mật khẩu database từ bên ngoài.
- **Biện pháp khắc phục:**
  1. Trong môi trường Production, xóa bỏ hoàn toàn `ports: - "5432:5432"`. Chỉ cho phép kết nối giữa Backend và Database qua mạng nội bộ Docker (`internal network`).
  2. Sử dụng Docker secrets hoặc file `.env` bảo vệ riêng biệt với mật khẩu ngẫu nhiên phức tạp trên 24 ký tự.
- **Chặn xuất xưởng:** **BẮT BUỘC KHẮC PHỤC TRONG PHASE 3C**.

---

### FINDING SEC-GAP-05: Thiếu Bộ Header Bảo Vệ Trình Duyệt (Missing Helmet Headers)
- **Mức độ:** **HIGH**
- **Thành phần ảnh hưởng:** `backend/src/main.ts`
- **Bằng chứng:** Không có middleware `helmet()` được đăng ký trong ứng dụng Express của NestJS.
- **Giải thích kỹ thuật:** Ứng dụng phản hồi các request API mà không có:
  - `X-Frame-Options: DENY` (Chống Clickjacking)
  - `X-Content-Type-Options: nosniff` (Chống MIME confusion attacks)
  - `Strict-Transport-Security` (Bắt buộc dùng HTTPS)
  - `Content-Security-Policy` (CSP)
- **Biện pháp khắc phục:**
  1. Cài đặt `helmet` vào dependencies của backend.
  2. Đăng ký `app.use(helmet())` ngay sau khi khởi tạo `NestFactory.create(AppModule)`.
- **Chặn xuất xưởng:** **BẮT BUỘC KHẮC PHỤC TRONG PHASE 3B**.

---

### FINDING SEC-GAP-06: Tài Liệu Swagger API Luôn Kích Hoạt Mặc Định
- **Mức độ:** **MEDIUM**
- **Thành phần ảnh hưởng:** `backend/src/main.ts` (Dòng 74-98)
- **Bằng chứng:**
  ```typescript
  SwaggerModule.setup(`${API_PREFIX}/docs`, app, document, ...);
  ```
- **Giải thích kỹ thuật:** Swagger UI và OpenAPI JSON spec được công khai tại `/api/v1/docs` mà không kiểm tra môi trường hoặc yêu cầu xác thực.
- **Tác động nghiệp vụ:** Giúp kẻ tấn công lập bản đồ cấu trúc API, các tham số DTO và danh sách endpoint một cách dễ dàng (Information Disclosure).
- **Biện pháp khắc phục:** Bổ sung điều kiện chỉ kích hoạt Swagger khi `process.env.NODE_ENV !== 'production'`, hoặc cấu hình HTTP Basic Authentication bảo vệ endpoint tài liệu này.
- **Chặn xuất xưởng:** **Khắc phục trong Phase 3B**.

---

### FINDING SEC-GAP-07: Cơ Chế Thu Hồi Phiên Đăng Nhập Cần Đồng Bộ Hóa Toàn Diện
- **Mức độ:** **MEDIUM**
- **Thành phần ảnh hưởng:** `backend/src/auth/auth.service.ts`
- **Giải thích kỹ thuật:** Khi người dùng đổi mật khẩu hoặc bị vô hiệu hóa tài khoản (`CommonStatus.INACTIVE`), Access Token cũ có thời hạn 15 phút vẫn có thể tiếp tục thực hiện các thao tác đọc dữ liệu cho đến khi hết hạn nếu không kiểm tra trạng thái người dùng trong `JwtStrategy`.
- **Biện pháp khắc phục:** Trong `JwtStrategy.validate()`, bổ sung truy vấn kiểm tra trạng thái người dùng có đang `ACTIVE` hay không hoặc kết hợp blacklist ngắn hạn qua Redis.
- **Chặn xuất xưởng:** **Khắc phục trong Phase 3B**.

---

### FINDING SEC-GAP-08: Thiếu Định Dạng Log Bảo Mật Tập Trung (Audit & Structured Logging)
- **Mức độ:** **MEDIUM**
- **Thành phần ảnh hưởng:** `backend/src/common/interceptors/logging.interceptor.ts`
- **Giải thích kỹ thuật:** Log hiện tại chỉ in ra Console dưới dạng văn bản đơn giản qua `Logger.log(...)`. Không có mã định danh Correlation ID (Request ID) xuyên suốt giữa Frontend và Backend, và chưa được định dạng JSON để phục vụ phân tích tự động bằng SIEM (Wazuh, Datadog, ELK).
- **Biện pháp khắc phục:** Tích hợp `winston` với cấu hình JSON logging và middleware gán `X-Correlation-ID` cho mỗi request.
- **Chặn xuất xưởng:** **Khắc phục trong Phase 3E**.

---

### FINDING SEC-GAP-09: CORS Origin Cần Khóa Chặt Cho Production
- **Mức độ:** **LOW**
- **Thành phần ảnh hưởng:** `backend/src/main.ts`
- **Bằng chứng:** Danh sách origin đang cho phép cả `localhost:3000` và `127.0.0.1:3000`.
- **Biện pháp khắc phục:** Khi chạy trên Production, chỉ cho phép đúng tên miền chính thức của doanh nghiệp (ví dụ: `https://bizpro.example.com`).
- **Chặn xuất xưởng:** **Khắc phục trong Phase 3B**.

---

## 4. KẾT LUẬN & ĐỀ XUẤT LỘ TRÌNH REMEDIATION

Tất cả 9 phát hiện trên đã được đối chiếu trực tiếp từ repository, không có rủi ro nào là "rủi ro lý thuyết". 

Để bảo đảm tính an toàn tối đa cho hệ thống BizPro+, đề xuất triển khai xử lý theo thứ tự:
1. **Giai đoạn 1 (Phase 3B - Security Hardening):** Khắc phục dứt điểm `SEC-GAP-01`, `SEC-GAP-02`, `SEC-GAP-03`, `SEC-GAP-05`, `SEC-GAP-06`, `SEC-GAP-07`, `SEC-GAP-09`.
2. **Giai đoạn 2 (Phase 3C - Container & Network Hardening):** Khắc phục dứt điểm `SEC-GAP-04`.
3. **Giai đoạn 3 (Phase 3E - Observability Hardening):** Khắc phục dứt điểm `SEC-GAP-08`.
