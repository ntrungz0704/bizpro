# ĐẶC TẢ KỸ THUẬT: PHASE 2F — HRM & WORKFORCE MANAGEMENT
**(PHASE 2F TECHNICAL SPECIFICATION)**

**Mã tài liệu:** `docs/PHASE_2F_TECHNICAL_SPECIFICATION.md`  
**Dự án:** BizPro+ Modular Enterprise ERP & Business Management System  
**Ngày ban hành:** 06/11/2026  
**Chuyên gia thực hiện:** Principal Software Architect & Senior Backend Engineer  
**Kính gửi:** Senior Technical Lead & System Architecture Board (ChatGPT)  
**Trạng thái tài liệu:** **DESIGN ONLY — READY FOR REVIEW**  

---

## 1. KIẾN TRÚC TỔNG THỂ (SYSTEM ARCHITECTURE)

Module HRM được thiết kế theo cấu trúc Modular Monolith trong NestJS, kế thừa nền tảng Security & Multi-Tenancy đã được nghiệm thu tại Phase 2A - 2E.

```
backend/src/hrm/
├── hrm.module.ts                 # Root Module khai báo controller, services, guards
├── hrm.controller.ts             # RESTful API endpoints phân hệ HRM
├── dto/
│   ├── employee.dto.ts           # DTO tạo & cập nhật nhân sự, validation
│   ├── department.dto.ts         # DTO phòng ban & chức vụ
│   ├── attendance.dto.ts         # DTO check-in, check-out, điều chỉnh công
│   └── leave.dto.ts              # DTO nộp đơn phép, phê duyệt đơn phép
├── services/
│   ├── employee.service.ts       # Quản lý hồ sơ nhân viên & lịch sử biến động
│   ├── attendance.service.ts     # Xử lý chấm công, ca làm việc, đối soát giờ
│   └── leave.service.ts          # State machine nghỉ phép, quản trị quỹ phép
└── interfaces/
    └── hrm.interface.ts          # TypeScript interfaces & types nội bộ
```

---

## 2. THUẬT TOÁN ĐỐI SOÁT & XỬ LÝ ĐỒNG THỜI (CONCURRENCY & TRANSACTION INTEGRITY)

### 2.1. Quản lý Quỹ phép Nguyên tử (Atomic Leave Balance Allocation)
Khi nhân viên nộp đơn xin nghỉ phép, hệ thống phải ngăn chặn nguy cơ Race Condition (nhân viên mở 2 tab trình duyệt và nộp đồng thời 2 đơn khi chỉ còn 1 ngày phép):
1. **Khóa bi quan (Pessimistic Row Lock):** Bắt đầu transaction dưới `runInTenantContext(orgId)`.
2. Khóa dòng số dư phép tương ứng bằng SQL:
   ```sql
   SELECT id, entitled_days, used_days, pending_days 
   FROM leave_balances 
   WHERE organization_id = ${orgId}::uuid 
     AND employee_id = ${employeeId}::uuid 
     AND leave_type_id = ${leaveTypeId}::uuid 
     AND year = ${year} 
   FOR UPDATE;
   ```
3. Kiểm tra điều kiện khả dụng:
   $$\text{available\_days} = \text{entitled\_days} - \text{used\_days} - \text{pending\_days}$$
   Nếu $\text{requested\_days} > \text{available\_days}$, hệ thống lập tức ném lỗi `BadRequestException('Số ngày phép khả dụng không đủ!')`.
4. Nếu hợp lệ: Cập nhật $\text{pending\_days} = \text{pending\_days} + \text{requested\_days}$, đồng thời tạo bản ghi `leave_requests` với trạng thái `PENDING`.
5. Khi Quản lý **Phê duyệt (`APPROVED`)**:
   $$\text{pending\_days} = \text{pending\_days} - \text{requested\_days}$$
   $$\text{used\_days} = \text{used\_days} + \text{requested\_days}$$
6. Khi Quản lý **Từ chối (`REJECTED`)** hoặc Nhân viên **Hủy (`CANCELLED`)**:
   $$\text{pending\_days} = \text{pending\_days} - \text{requested\_days}$$
   Số ngày phép được hoàn trả nguyên vẹn vào quỹ khả dụng.

### 2.2. Xử lý Chấm công & Múi giờ Việt Nam (UTC+7 Asia/Ho_Chi_Minh)
1. Toàn bộ tính toán ngày làm việc (`work_date`) và giờ Check-in/Check-out được chuẩn hóa theo múi giờ `Asia/Ho_Chi_Minh` (GMT+7).
2. Quy tắc ghi nhận giờ làm:
   - Ca làm việc: `startTime = 08:30:00`, `endTime = 17:30:00`, `breakDurationMinutes = 60`.
   - Nếu `checkInAt > startTime + 15 phút`: Trạng thái ghi nhận `LATE` (Đi muộn).
   - Nếu `checkOutAt < endTime - 15 phút`: Trạng thái ghi nhận `EARLY_LEAVE` (Về sớm).
   - Nếu có cả hai: Trạng thái ghi nhận `LATE_AND_EARLY`.
   - Nếu nhân viên không check-in trong ngày làm việc mà không có đơn phép: Đánh dấu `ABSENT` (Vắng mặt).

---

## 3. BẢO MẬT MULTI-TENANT & POSTGRESQL RLS (FAIL-CLOSED)

Tất cả các bảng thuộc phân hệ HRM:
- `departments`
- `positions`
- `employees`
- `employee_contracts`
- `work_shifts`
- `attendance_records`
- `leave_types`
- `leave_balances`
- `leave_requests`
- `employee_histories`

Đều phải áp dụng tiêu chuẩn bảo mật đã được kiểm chứng ở Phase 2E:
1. `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`
2. `ALTER TABLE <table_name> FORCE ROW LEVEL SECURITY;`
3. Policy duy nhất cho runtime role `bizpro_app`:
   ```sql
   CREATE POLICY tenant_isolation_policy ON <table_name>
     FOR ALL
     TO bizpro_app
     USING (
       organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid
     )
     WITH CHECK (
       organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid
     );
   ```
4. **Không có bất kỳ nhánh bypass `app.is_system_context` nào.**
5. Mọi thao tác truy vấn / cập nhật đều chạy qua `this.prisma.runInTenantContext(orgId, async (tx) => ...)`.
