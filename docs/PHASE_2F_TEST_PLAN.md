# KẾ HOẠCH KIỂM THỬ: PHASE 2F — HRM & WORKFORCE MANAGEMENT
**(PHASE 2F TEST PLAN & AUTOMATION SPECIFICATION)**

**Mã tài liệu:** `docs/PHASE_2F_TEST_PLAN.md`  
**Dự án:** BizPro+ Modular Enterprise ERP & Business Management System  
**Ngày ban hành:** 06/11/2026  
**Chuyên gia thực hiện:** Principal QA Architect & Senior Test Automation Lead  
**Kính gửi:** Senior Technical Lead & System Architecture Board (ChatGPT)  
**Trạng thái tài liệu:** **DESIGN ONLY — READY FOR REVIEW**  

---

## 1. MỤC TIÊU KIỂM THỬ (TEST OBJECTIVES)

Kế hoạch kiểm thử Phase 2F nhằm mục đích bảo đảm:
1. **Toàn vẹn Nghiệp vụ HRM:** 100% các tính năng Quản lý Nhân sự, Chấm công, Nghỉ phép hoạt động đúng quy chuẩn BLLĐ 2019 và logic thiết kế.
2. **Chống âm quỹ phép & Xử lý đồng thời (Concurrency Integrity):** Ngăn chặn hoàn toàn việc trừ trùng lặp hoặc âm quỹ ngày phép khi có nhiều yêu cầu đồng thời.
3. **Bảo mật Đa khách thuê (Multi-Tenant Isolation):** RLS bảo vệ fail-closed 100% dữ liệu nhân viên, chấm công, nghỉ phép giữa các tổ chức khác nhau.
4. **Phân quyền chức năng (Function-Level RBAC):** Kiểm soát nghiêm ngặt quyền truy cập theo Ma trận RBAC.

---

## 2. DANH MỤC CÁC KỊCH BẢN KIỂM THỬ E2E DỰ KIẾN (TEST CASES)

Tập hợp kiểm thử dự kiến triển khai tại `backend/test/phase2f.e2e-spec.ts`:

### Nhóm 1: Cơ cấu Tổ chức & Hồ sơ Nhân sự (Master Data)
- **TC-HRM-01:** Khởi tạo Phòng ban và Chức vụ thành công (`POST /api/hrm/departments`, `POST /api/hrm/positions`).
- **TC-HRM-02:** Tạo mới hồ sơ nhân viên (`POST /api/hrm/employees`) với thông tin hợp lệ (SĐT Việt Nam chuẩn `0987654321`, Email RFC).
- **TC-HRM-03:** Kiểm tra ràng buộc duy nhất: Trùng `employee_code` trong cùng tổ chức trả về lỗi `409 Conflict`.
- **TC-HRM-04:** Xác thực dữ liệu đầu vào: Nhập SĐT chứa chữ hoặc CCCD không đúng quy cách bị chặn với mã lỗi `400 Bad Request`.

### Nhóm 2: Chấm công & Quản lý Ca làm việc (Time & Attendance)
- **TC-ATT-01:** Nhân viên Check-in thành công đầu ca (`POST /api/hrm/attendance/check-in`), bản ghi được tạo với trạng thái `PRESENT`.
- **TC-ATT-02:** Nhân viên Check-out kết thúc ca làm việc (`POST /api/hrm/attendance/check-out`).
- **TC-ATT-03:** Chấm công lặp lại trong cùng ngày: Check-in lần 2 trong cùng ngày bị từ chối hoặc cập nhật hợp lệ.
- **TC-ATT-04:** Quản lý HR điều chỉnh giờ công (`POST /api/hrm/attendance/:id/adjust`) có lưu vết `adjusted_by` và `adjustment_reason`.

### Nhóm 3: Nghỉ phép & Quản trị Quỹ phép (Leave Management)
- **TC-LV-01:** Khởi tạo số dư phép năm cho nhân viên (`entitled_days = 12.0`).
- **TC-LV-02:** Nhân viên nộp đơn xin nghỉ phép 2 ngày (`POST /api/hrm/leave/requests`), quỹ phép chuyển: `pending_days = 2.0`, `available_days = 10.0`.
- **TC-LV-03:** Quản lý phê duyệt đơn nghỉ phép (`POST /api/hrm/leave/requests/:id/approve`), quỹ phép chuyển: `pending_days = 0.0`, `used_days = 2.0`.
- **TC-LV-04:** Quản lý từ chối đơn (`POST /api/hrm/leave/requests/:id/reject`), hoàn trả nguyên vẹn `pending_days` về quỹ khả dụng (`available_days = 12.0`).
- **TC-LV-05 (Chống âm quỹ phép):** Nhân viên còn 1 ngày phép nhưng nộp đơn xin nghỉ 3 ngày phép năm -> Bị từ chối ngay với `400 Bad Request` ("Số ngày phép không đủ").

### Nhóm 4: Kiểm thử Xử lý Đồng thời (Concurrency Test)
- **TC-CONC-HR-01:** Nhân viên còn đúng 1.0 ngày phép khả dụng. Thực hiện bắn đồng thời 10 HTTP requests nộp đơn xin nghỉ 1.0 ngày:
  - **Kỳ vọng:** Đúng 1 request thành công (`201 Created`), 9 requests còn lại bị chặn với `400 Bad Request`.
  - Quỹ ngày phép cuối cùng: `pending_days = 1.0`, `available_days = 0.0`, không bao giờ bị âm.

### Nhóm 5: Kiểm thử Phân quyền (RBAC) & Cách ly Đa khách thuê (Tenant Isolation)
- **TC-RBAC-HR-01:** Nhân viên thông thường gọi endpoint duyệt phép `POST /api/hrm/leave/requests/:id/approve` -> Bị từ chối với `403 Forbidden`.
- **TC-ISO-HR-01:** Người dùng từ Org B cố gắng truy vấn hồ sơ nhân viên hoặc đơn nghỉ phép của Org A -> Nhận mã lỗi `404 Not Found` (Fail-Closed tuyệt đối).

---

## 3. TIÊU CHÍ NGHIỆM THU KIỂM THỬ (ACCEPTANCE CRITERIA)

1. 100% các Test Cases của Phase 2F trong `backend/test/phase2f.e2e-spec.ts` đạt trạng thái **PASS**.
2. **Zero Regression:** Toàn bộ 107 test cases của Phase 2A - 2E tiếp tục duy trì trạng thái **100% PASS**.
3. `npm run build` hoàn thành với **0 lỗi TypeScript**.
