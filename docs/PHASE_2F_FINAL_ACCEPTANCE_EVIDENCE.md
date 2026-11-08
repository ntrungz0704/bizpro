# BẰNG CHỨNG NGHIỆM THU THIẾT KẾ CUỐI CÙNG: PHASE 2F — HRM & WORKFORCE MANAGEMENT
**(PHASE 2F FINAL ACCEPTANCE EVIDENCE REPORT)**

**Mã tài liệu:** `docs/PHASE_2F_FINAL_ACCEPTANCE_EVIDENCE.md`  
**Dự án:** BizPro+ Modular Enterprise ERP & Business Management System  
**Ngày ban hành:** 06/11/2026  
**Chuyên gia thực hiện:** Principal Software Architect & Security Reviewer  
**Kính gửi:** Senior Technical Lead & System Architecture Board (ChatGPT)  
**Trạng thái tài liệu:** **PHASE 2F — FINAL ACCEPTANCE EVIDENCE READY**  

---

## 1. XÁC NHẬN NGUYÊN TẮC QUẢN TRỊ DỰ ÁN

Nhóm kỹ sư kiến trúc xác nhận tuyệt đối:
- **Zero Code Modification:** Chưa có dòng code nào trong `backend/src/` hay `frontend/` bị chỉnh sửa.
- **Zero Schema Modification:** File `prisma/schema.prisma` và `backend/prisma/schema.prisma` được giữ nguyên trạng 100%.
- **Zero Migration Execution:** Không có lệnh DDL/DML nào chạy vào cơ sở dữ liệu PostgreSQL 16.
- Toàn bộ bằng chứng dưới đây được trích xuất trực tiếp từ 7 tài liệu thiết kế đã lưu tại `docs/` và schema Prisma hiện hữu.

---

## 2. NĂM NHÓM BẰNG CHỨNG CHI TIẾT (GROUPS A – E)

### NHÓM A: DATABASE DESIGN & SCHEMA INTEGRITY
*(Nguồn trích xuất: `docs/PHASE_2F_DATABASE_DESIGN.md` & `backend/prisma/schema.prisma:535-750`)*

1. **Cả 10 bảng đều có trực tiếp cột `organization_id uuid NOT NULL`:**
   - `departments`: `organization_id uuid` (Line 537)
   - `positions`: `organization_id uuid` (Line 557)
   - `employees`: `organization_id uuid` (Line 574)
   - `employee_contracts`: `organization_id uuid` (Line 611)
   - `work_shifts`: `organization_id uuid` (Line 633)
   - `attendance_records`: `organization_id uuid` (Line 652)
   - `leave_types`: `organization_id uuid` (Line 676)
   - `leave_balances`: `organization_id uuid` (Line 695)
   - `leave_requests`: `organization_id uuid` (Line 713)
   - `employee_histories`: `organization_id uuid` (Line 737)
2. **Khóa chính & Khóa ngoại (PK/FK):**
   - 100% Khóa chính dùng `uuid` với `gen_random_uuid()`.
   - Khóa ngoại liên kết chặt chẽ:
     - `employees.department_id` -> `departments.id` (ON DELETE RESTRICT)
     - `employees.position_id` -> `positions.id` (ON DELETE RESTRICT)
     - `employees.manager_employee_id` -> `employees.id` (Self-relation ON DELETE SET NULL)
     - `leave_balances.employee_id` -> `employees.id` (ON DELETE CASCADE)
     - `leave_balances.leave_type_id` -> `leave_types.id` (ON DELETE RESTRICT)
     - `leave_requests.employee_id` -> `employees.id` (ON DELETE CASCADE)
     - `leave_requests.approver_employee_id` -> `employees.id` (ON DELETE SET NULL)
3. **Ràng buộc duy nhất (Unique Constraints):**
   - `departments`: `UNIQUE (organization_id, code)`
   - `positions`: `UNIQUE (organization_id, code)`
   - `employees`: `UNIQUE (organization_id, employee_code)`
   - `employee_contracts`: `UNIQUE (organization_id, contract_number)`
   - `work_shifts`: `UNIQUE (organization_id, code)`
   - `attendance_records`: `UNIQUE (organization_id, employee_id, work_date)`
   - `leave_types`: `UNIQUE (organization_id, code)`
   - `leave_balances`: `UNIQUE (organization_id, employee_id, leave_type_id, year)`
4. **Chỉ mục hiệu năng (Performance Indexes):**
   - `employees`: `INDEX (organization_id, department_id)`
   - `attendance_records`: `INDEX (organization_id, work_date)`
   - `leave_requests`: `INDEX (organization_id, employee_id, status)`
5. **Không trùng lặp:** Tái sử dụng 100% schema hiện hữu từ Phase 1D, không tạo thêm bảng mới.

---

### NHÓM B: API CONTRACT & VALIDATION RULES
*(Nguồn trích xuất: `docs/PHASE_2F_API_CONTRACT.md`)*

| Method | Endpoint | Quyền yêu cầu (RBAC) | Request DTO & Validation | Response Format |
|:---|:---|:---|:---|:---|
| `GET` | `/api/hrm/departments` | `hrm.departments.view` | Query: `search?` | `DepartmentTreeDto[]` |
| `POST` | `/api/hrm/departments` | `hrm.departments.manage` | Body: `{ code, name, parentDepartmentId?, managerEmployeeId? }` | `201 Created` |
| `GET` | `/api/hrm/positions` | `hrm.positions.view` | Query: `search?` | `PositionDto[]` |
| `POST` | `/api/hrm/positions` | `hrm.positions.manage` | Body: `{ code, name, description? }` | `201 Created` |
| `GET` | `/api/hrm/employees` | `hrm.employees.view` | Query: `search?`, `departmentId?`, `employmentStatus?`, `page`, `limit` | Paginated `{ items, total, page, totalPages }` |
| `POST` | `/api/hrm/employees` | `hrm.employees.manage` | Body: `{ employeeCode, fullName, email, phone, dateOfBirth?, hireDate, departmentId?, positionId? }` (Validate SĐT VN regex `^(0\|\+84)(3\|5\|7\|8\|9)[0-9]{8}$`) | `201 Created` |
| `POST` | `/api/hrm/attendance/check-in` | `hrm.attendance.clock` | Body: Rỗng (Lấy identity từ JWT) | `{ id, employeeId, workDate, checkInAt, status }` |
| `POST` | `/api/hrm/attendance/check-out` | `hrm.attendance.clock` | Body: Rỗng (Lấy identity từ JWT) | `{ id, employeeId, workDate, checkOutAt, status }` |
| `POST` | `/api/hrm/attendance/:id/adjust` | `hrm.attendance.manage` | Body: `{ checkInAt, checkOutAt, status, adjustmentReason }` | `200 OK` |
| `GET` | `/api/hrm/leave/balances/my` | `hrm.leave.request` | Query: `year?` (Default năm hiện tại) | `{ year, entitledDays, usedDays, pendingDays, availableDays }` |
| `POST` | `/api/hrm/leave/requests` | `hrm.leave.request` | Body: `{ leaveTypeId, startDate, endDate, totalDays, reason }` | `201 Created` (Status: `PENDING`) |
| `POST` | `/api/hrm/leave/requests/:id/approve` | `hrm.leave.approve` | Body: Rỗng | `200 OK` (Status: `APPROVED`) |
| `POST` | `/api/hrm/leave/requests/:id/reject` | `hrm.leave.approve` | Body: `{ rejectionReason }` | `200 OK` (Status: `REJECTED`) |
| `POST` | `/api/hrm/leave/requests/:id/cancel` | `hrm.leave.request` | Body: Rỗng | `200 OK` (Status: `CANCELLED`) |

---

### NHÓM C: RBAC MATRIX, IDOR & SELF-APPROVAL PREVENTION
*(Nguồn trích xuất: `docs/PHASE_2F_RBAC_MATRIX.md`)*

1. **Ma trận đầy đủ 14 Quyền × 5 Vai trò:**
   - `hrm.departments.view`: ADMIN, HR_MANAGER, DEPT_HEAD, EMPLOYEE, SALES_STAFF
   - `hrm.departments.manage`: ADMIN, HR_MANAGER
   - `hrm.positions.view`: ADMIN, HR_MANAGER, DEPT_HEAD, EMPLOYEE, SALES_STAFF
   - `hrm.positions.manage`: ADMIN, HR_MANAGER
   - `hrm.employees.view`: ADMIN, HR_MANAGER, DEPT_HEAD (Cấp dưới), EMPLOYEE (Cơ bản), SALES_STAFF (Cơ bản)
   - `hrm.employees.view_sensitive` (Lương, Hợp đồng, CCCD): ADMIN, HR_MANAGER
   - `hrm.employees.manage`: ADMIN, HR_MANAGER
   - `hrm.contracts.manage`: ADMIN, HR_MANAGER
   - `hrm.attendance.clock`: ADMIN, HR_MANAGER, DEPT_HEAD, EMPLOYEE, SALES_STAFF
   - `hrm.attendance.view_my`: ADMIN, HR_MANAGER, DEPT_HEAD, EMPLOYEE, SALES_STAFF
   - `hrm.attendance.view_all`: ADMIN, HR_MANAGER, DEPT_HEAD (Bộ phận mình)
   - `hrm.attendance.manage`: ADMIN, HR_MANAGER
   - `hrm.leave.request`: ADMIN, HR_MANAGER, DEPT_HEAD, EMPLOYEE, SALES_STAFF
   - `hrm.leave.approve`: ADMIN, HR_MANAGER, DEPT_HEAD (Cấp dưới)
   - `hrm.leave.manage`: ADMIN, HR_MANAGER
2. **Quy tắc Chống Tự Duyệt Phép (Self-Approval Prevention):**
   Tại tầng Service `approveLeaveRequest`:
   ```typescript
   if (leaveRequest.employeeId === currentEmployeeId && userRole !== 'ADMIN') {
     throw new ForbiddenException('Nhân viên không được phép tự phê duyệt đơn nghỉ phép của chính mình!');
   }
   ```
3. **Quy tắc Chống IDOR:**
   Mọi truy vấn dữ liệu cá nhân (`/attendance/history`, `/leave/balances/my`, `/leave/requests`) đều lấy `employeeId` được ánh xạ trực tiếp từ `req.user.id` qua liên kết 1-1 `users.employee_id`, không chấp nhận `employeeId` từ client payload.

---

### NHÓM D: LEAVE WORKFLOW, STATE MACHINE & PHÁP LÝ LAO ĐỘNG
*(Nguồn trích xuất: `docs/PHASE_2F_BUSINESS_REQUIREMENTS.md` & `docs/PHASE_2F_TECHNICAL_SPECIFICATION.md`)*

1. **Cấu hình Phép năm theo Bộ luật Lao động 2019 (Điều 113 & 114):**
   - **Mức mặc định:** 12.0 ngày/năm cho người làm việc trong điều kiện bình thường.
   - **Khả năng cấu hình:** Bảng `leave_types` lưu `annual_quota decimal(5,1)`. Cho phép doanh nghiệp tạo các loại phép đặc thù:
     - `ANNUAL_NORMAL`: 12.0 ngày
     - `ANNUAL_HEAVY` (Lao động nặng nhọc, độc hại): 14.0 ngày
     - `ANNUAL_SPECIAL` (Đặc biệt nặng nhọc, độc hại, khuyết tật): 16.0 ngày
   - **Thâm niên:** Cộng 1 ngày cho mỗi đủ 5 năm làm việc.
   - **Chưa đủ 12 tháng:** Số ngày phép = (Số tháng làm việc thực tế trong năm / 12) × Quota năm.
2. **Quy tắc Trừ Quỹ Phép Nguyên tử (Atomic Balance Rules):**
   - $\text{available\_days} = \text{entitled\_days} - \text{used\_days} - \text{pending\_days}$
   - **Khi Nộp đơn (`PENDING`):**
     Khóa dòng `leave_balances` bằng `SELECT FOR UPDATE`. Tăng `pending_days = pending_days + requested_days`. `used_days` KHÔNG thay đổi.
   - **Khi Phê duyệt (`APPROVED`):**
     Khóa dòng `leave_balances` bằng `SELECT FOR UPDATE`.
     Giảm `pending_days = pending_days - requested_days`.
     Tăng `used_days = used_days + requested_days`.
   - **Khi Từ chối (`REJECTED`) hoặc Hủy trước khi duyệt (`CANCELLED`):**
     Giảm `pending_days = pending_days - requested_days`. Phép quay về `available_days`.
   - **Xử lý Hủy đơn ĐÃ DUYỆT (`APPROVED` rồi `CANCELLED`):**
     Nếu đơn đã được duyệt nhưng nhân viên không nghỉ (hủy trước ngày `startDate`):
     Trong transaction khóa `FOR UPDATE`:
     Giảm `used_days = used_days - requested_days`.
     Cập nhật trạng thái đơn thành `CANCELLED`. Ngày phép được hoàn trả nguyên vẹn về quỹ khả dụng.
   - **Chống Giải phóng Phép Hai lần (Double-Release Prevention):**
     Khóa bản ghi `leave_requests` bằng `SELECT id, status FROM leave_requests WHERE id = $1 FOR UPDATE`. Chỉ thực hiện hoàn phép khi đơn ở trạng thái hợp lệ (`PENDING` hoặc `APPROVED`), nếu đã `REJECTED` hoặc `CANCELLED` trước đó sẽ ném lỗi `BadRequestException`.
   - **Xử lý Đơn Nghỉ Kéo dài Qua 2 Năm Phép:**
     Giao diện và Backend tách đơn tự động: Phần ngày nghỉ thuộc năm $N$ trừ vào `leave_balances` của năm $N$; phần ngày nghỉ thuộc năm $N+1$ trừ vào `leave_balances` của năm $N+1$.
   - **Xử lý 2 Đơn Gửi Đồng thời (Concurrent Submission):**
     Nhờ `SELECT FOR UPDATE` trên `leave_balances`, transaction thứ hai phải chờ transaction thứ nhất commit. Khi transaction 2 đọc lại `available_days`, nếu không đủ số dư sẽ lập tức bị chặn với lỗi `400 Bad Request`.

---

### NHÓM E: KẾ HOẠCH KIỂM THỬ (TEST PLAN & AUTOMATION SUITE)
*(Nguồn trích xuất: `docs/PHASE_2F_TEST_PLAN.md`)*

Kịch bản tự động hóa dự kiến tại `backend/test/phase2f.e2e-spec.ts`:

1. **TC-HRM-CRUD-01:** Khởi tạo Phòng ban, Chức vụ và Hồ sơ Nhân sự hợp lệ (`POST /api/hrm/employees` -> `201 Created`).
2. **TC-HRM-VALID-01:** Bắt lỗi định dạng SĐT Việt Nam: Nhập chữ hoặc sai đầu số bị chặn với `400 Bad Request`.
3. **TC-HRM-UNIQUE-01:** Kiểm tra tính duy nhất: Trùng `employee_code` trong cùng tổ chức nhận `409 Conflict`.
4. **TC-ATT-CLOCK-01:** Check-in và Check-out hàng ngày tính toán đúng trạng thái `PRESENT` / `LATE`.
5. **TC-LV-LIFECYCLE-01:** Vòng đời nghỉ phép: `PENDING` (tăng pending) -> `APPROVED` (chuyển pending sang used).
6. **TC-LV-CANCEL-01:** Hủy đơn đã `APPROVED` trước ngày nghỉ: Hoàn trả chính xác `used_days` về quỹ khả dụng.
7. **TC-CONC-LV-01 (Kiểm thử Concurrency):** Nhân viên còn đúng 1.0 ngày phép. Bắn đồng thời 10 HTTP requests nộp đơn xin nghỉ 1.0 ngày:
   - **Kỳ vọng:** Đúng 1 request thành công (`201 Created`), 9 requests còn lại bị chặn với `400 Bad Request`. Quỹ phép cuối cùng: `available_days = 0.0`, không bao giờ bị âm.
8. **TC-CONC-APPROVE-01 (Chống Double Approval):** Bắn đồng thời 5 requests phê duyệt cùng 1 đơn nghỉ phép:
   - **Kỳ vọng:** Đúng 1 request thành công (`200 OK`), 4 requests còn lại nhận `400 Bad Request` ("Đơn đã được xử lý").
9. **TC-RBAC-HR-01:** Nhân viên thường không có quyền `hrm.leave.approve` gọi endpoint duyệt phép nhận `403 Forbidden`.
10. **TC-RBAC-SELF-01:** Nhân viên cố gắng tự duyệt đơn nghỉ phép của chính mình bị chặn với `403 Forbidden`.
11. **TC-ISO-HR-01:** User Org B cố gắng truy vấn hoặc duyệt đơn nghỉ phép của Org A nhận `404 Not Found` (RLS Fail-Closed).
12. **TC-TX-ROLLBACK-01:** Khi có lỗi phát sinh giữa chừng trong transaction nghỉ phép, toàn bộ thay đổi trên `leave_balances` và `leave_requests` được rollback 100%.

---

## 3. KẾT LUẬN & ĐỀ XUẤT HỘI ĐỒNG KIẾN TRÚC

Bộ 5 nhóm bằng chứng A – E đã giải đáp hoàn chỉnh, triệt để mọi câu hỏi nghiệp vụ, pháp lý và bảo mật do Senior Technical Lead đặt ra.

**TRẠNG THÁI NGHIỆM THU CUỐI CÙNG:**
# **PHASE 2F — FINAL ACCEPTANCE EVIDENCE READY**

Kính đề nghị Senior Technical Lead & Code Auditor (ChatGPT):
1. **CHÍNH THỨC PHÊ CHUẨN THIẾT KẾ: PHASE 2F DESIGN — ACCEPTED**.
2. **CHÍNH THỨC MỞ IMPLEMENTATION GATE CHO PHASE 2F (HRM & WORKFORCE MANAGEMENT)** để nhóm kỹ sư bắt đầu triển khai code backend NestJS, migration RLS và bộ kiểm thử tự động E2E!
