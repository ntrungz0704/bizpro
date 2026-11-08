# HỢP ĐỒNG GIAO DIỆN API: PHASE 2F — HRM & WORKFORCE MANAGEMENT
**(PHASE 2F RESTFUL API CONTRACT SPECIFICATION)**

**Mã tài liệu:** `docs/PHASE_2F_API_CONTRACT.md`  
**Dự án:** BizPro+ Modular Enterprise ERP & Business Management System  
**Ngày ban hành:** 06/11/2026  
**Chuyên gia thực hiện:** Principal Software Architect & Senior API Engineer  
**Kính gửi:** Senior Technical Lead & System Architecture Board (ChatGPT)  
**Trạng thái tài liệu:** **DESIGN ONLY — READY FOR REVIEW**  

---

## 1. TIÊU CHUẨN THIẾT KẾ & HEADER QUY CHUẨN

- **Base URL:** `/api/hrm`
- **Authentication:** Bearer Token JWT (Header: `Authorization: Bearer <access_token>`).
- **Response Format:** Bọc chuẩn bởi `TransformResponseInterceptor`:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "data": { ... },
    "meta": { "timestamp": "2026-11-06T09:00:00.000Z" }
  }
  ```
- **Error Format:** Bọc chuẩn bởi `HttpExceptionFilter`:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Số ngày phép khả dụng không đủ để thực hiện yêu cầu!"
  }
  ```

---

## 2. DANH MỤC ENDPOINTS PHÒNG BAN & CHỨC VỤ

### 2.1. `GET /api/hrm/departments`
- **Quyền yêu cầu:** `hrm.departments.view`
- **Response:** Danh sách cây phòng ban kèm số lượng nhân sự.

### 2.2. `POST /api/hrm/departments`
- **Quyền yêu cầu:** `hrm.departments.manage`
- **Request Body:**
  ```json
  {
    "code": "DEPT-SALES-MB",
    "name": "Phòng Kinh doanh Miền Bắc",
    "parentDepartmentId": "uuid-optional",
    "managerEmployeeId": "uuid-optional"
  }
  ```

---

## 3. DANH MỤC ENDPOINTS HỒ SƠ NHÂN SỰ (EMPLOYEES)

### 3.1. `GET /api/hrm/employees`
- **Quyền yêu cầu:** `hrm.employees.view`
- **Query Params:**
  - `search`: Tìm kiếm theo mã nhân viên, họ tên, email, SĐT.
  - `departmentId`: Lọc theo phòng ban.
  - `employmentStatus`: `PROBATION`, `OFFICIAL`, `SUSPENDED`, `TERMINATED`.
  - `page`: Trang hiện tại (Default: 1).
  - `limit`: Số bản ghi/trang (Default: 20, Max: 100).

### 3.2. `POST /api/hrm/employees`
- **Quyền yêu cầu:** `hrm.employees.manage`
- **Request Body:**
  ```json
  {
    "employeeCode": "EMP-001001",
    "fullName": "Lê Văn An",
    "email": "an.lv@bizpro.vn",
    "phone": "0987654321",
    "dateOfBirth": "1992-05-15",
    "gender": "MALE",
    "address": "Số 12 Duy Tân, Cầu Giấy, Hà Nội",
    "departmentId": "uuid-dept",
    "positionId": "uuid-pos",
    "managerEmployeeId": "uuid-manager-optional",
    "hireDate": "2026-01-01",
    "employmentStatus": "OFFICIAL"
  }
  ```
- **Validation Rules:**
  - `phone`: Regex chuẩn số điện thoại Việt Nam `^(0|\+84)(3|5|7|8|9)[0-9]{8}$`.
  - `email`: Định dạng RFC 5322 email.
  - `employeeCode`: Chuỗi không rỗng, duy nhất trong cùng tenant.

---

## 4. DANH MỤC ENDPOINTS CHẤM CÔNG (TIME & ATTENDANCE)

### 4.1. `POST /api/hrm/attendance/check-in`
- **Quyền yêu cầu:** `hrm.attendance.clock` (Mọi nhân viên có tài khoản)
- **Mô tả:** Nhân viên bấm Check-in vào đầu ca làm việc.
- **Payload:** Rỗng (Tự động nhận diện `userId` -> `employeeId`, ghi nhận thời gian thực server UTC+7).
- **Response:**
  ```json
  {
    "id": "uuid",
    "employeeId": "uuid",
    "workDate": "2026-11-06",
    "checkInAt": "2026-11-06T08:25:00.000Z",
    "status": "PRESENT"
  }
  ```

### 4.2. `POST /api/hrm/attendance/check-out`
- **Quyền yêu cầu:** `hrm.attendance.clock`
- **Mô tả:** Nhân viên bấm Check-out khi kết thúc ca làm việc. Tự động đối soát với giờ ca làm việc (`work_shifts`) để tính toán trạng thái `PRESENT`, `LATE`, hoặc `EARLY_LEAVE`.

### 4.3. `POST /api/hrm/attendance/:id/adjust`
- **Quyền yêu cầu:** `hrm.attendance.manage` (HR Manager)
- **Request Body:**
  ```json
  {
    "checkInAt": "2026-11-06T08:30:00.000Z",
    "checkOutAt": "2026-11-06T17:30:00.000Z",
    "status": "PRESENT",
    "adjustmentReason": "Nhân viên quên chấm công do tiếp khách ngoài công trường."
  }
  ```

---

## 5. DANH MỤC ENDPOINTS NGHỈ PHÉP (LEAVE MANAGEMENT)

### 5.1. `GET /api/hrm/leave/balances/my`
- **Quyền yêu cầu:** `hrm.leave.request`
- **Response:** Số dư ngày phép của nhân viên đang đăng nhập trong năm hiện tại:
  ```json
  {
    "year": 2026,
    "entitledDays": 12.0,
    "usedDays": 2.5,
    "pendingDays": 1.0,
    "availableDays": 8.5
  }
  ```

### 5.2. `POST /api/hrm/leave/requests`
- **Quyền yêu cầu:** `hrm.leave.request`
- **Request Body:**
  ```json
  {
    "leaveTypeId": "uuid-leave-type",
    "startDate": "2026-11-10",
    "endDate": "2026-11-11",
    "totalDays": 2.0,
    "reason": "Giải quyết việc cá nhân gia đình."
  }
  ```
- **Xử lý:** Khóa bi quan `SELECT FOR UPDATE` trên `leave_balances`, kiểm tra số ngày khả dụng, tăng `pending_days` và tạo đơn ở trạng thái `PENDING`.

### 5.3. `POST /api/hrm/leave/requests/:id/approve`
- **Quyền yêu cầu:** `hrm.leave.approve` (Trưởng phòng / Quản lý)
- **Response:** Cập nhật trạng thái `APPROVED`, chuyển `pending_days` -> `used_days`.

### 5.4. `POST /api/hrm/leave/requests/:id/reject`
- **Quyền yêu cầu:** `hrm.leave.approve`
- **Request Body:** `{"rejectionReason": "Thời gian trùng với đợt chạy dự án cao điểm."}`
- **Response:** Cập nhật `REJECTED`, hoàn trả `pending_days` vào quỹ phép khả dụng.

### 5.5. `POST /api/hrm/leave/requests/:id/cancel`
- **Quyền yêu cầu:** `hrm.leave.request`
- **Mô tả:** Người tạo đơn tự hủy khi đơn chưa diễn ra. Hoàn trả ngày phép tương ứng về số dư khả dụng.
