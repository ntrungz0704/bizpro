# MA TRẬN PHÂN QUYỀN RBAC: PHASE 2F — HRM & WORKFORCE MANAGEMENT
**(PHASE 2F ROLE-BASED ACCESS CONTROL SPECIFICATION)**

**Mã tài liệu:** `docs/PHASE_2F_RBAC_MATRIX.md`  
**Dự án:** BizPro+ Modular Enterprise ERP & Business Management System  
**Ngày ban hành:** 06/11/2026  
**Chuyên gia thực hiện:** Principal Security Architect & RBAC Specialist  
**Kính gửi:** Senior Technical Lead & System Architecture Board (ChatGPT)  
**Trạng thái tài liệu:** **DESIGN ONLY — READY FOR REVIEW**  

---

## 1. DANH MỤC QUYỀN HẠN PHÂN HỆ HRM (PERMISSIONS CATALOG)

Toàn bộ quyền hạn thuộc Module HRM được định danh theo quy ước `hrm.<domain>.<action>`:

| Mã Quyền (Permission Code) | Tên Quyền | Phạm vi & Mô tả |
|:---|:---|:---|
| `hrm.departments.view` | Xem cơ cấu phòng ban | Xem danh sách phòng ban, sơ đồ tổ chức |
| `hrm.departments.manage` | Quản trị phòng ban | Tạo mới, sửa, xóa, chỉ định trưởng bộ phận |
| `hrm.positions.view` | Xem danh mục chức vụ | Xem danh mục chức danh, vị trí công việc |
| `hrm.positions.manage` | Quản trị chức vụ | Tạo mới, cập nhật danh mục chức vụ |
| `hrm.employees.view` | Xem hồ sơ nhân sự | Xem danh sách và thông tin nhân viên thông thường |
| `hrm.employees.view_sensitive` | Xem thông tin nhạy cảm | Xem mức lương, hợp đồng, CCCD, thông tin ngân hàng |
| `hrm.employees.manage` | Quản trị nhân viên | Tiếp nhận nhân sự mới, cập nhật hồ sơ, điều chuyển |
| `hrm.contracts.manage` | Quản lý hợp đồng | Tạo, gia hạn, chấm dứt hợp đồng lao động |
| `hrm.attendance.clock` | Tự chấm công | Thực hiện Check-in / Check-out ca làm việc cá nhân |
| `hrm.attendance.view_my` | Xem bảng công cá nhân | Xem lịch sử giờ vào/ra, số công trong tháng của bản thân |
| `hrm.attendance.view_all` | Xem bảng công toàn tổ chức | Xem và xuất báo cáo chấm công của nhân viên toàn công ty |
| `hrm.attendance.manage` | Điều chỉnh chấm công | Sửa đổi bản ghi giờ chấm công khi có giải trình |
| `hrm.leave.request` | Nộp đơn xin nghỉ phép | Tự tạo đơn nghỉ phép, xem số dư phép cá nhân |
| `hrm.leave.approve` | Phê duyệt đơn nghỉ phép | Duyệt hoặc từ chối đơn xin nghỉ phép của cấp dưới |
| `hrm.leave.manage` | Quản trị quỹ ngày phép | Thiết lập loại phép, điều chỉnh số dư phép năm cho nhân sự |

---

## 2. MA TRẬN PHÂN QUYỀN THEO VAI TRÒ (ROLE-PERMISSION MATRIX)

| Mã Quyền | ADMIN (Toàn quyền) | HR_MANAGER (Quản trị Nhân sự) | DEPT_HEAD (Trưởng bộ phận) | EMPLOYEE (Nhân viên) | SALES / WH_STAFF (Nhân viên nghiệp vụ) |
|:---|:---:|:---:|:---:|:---:|:---:|
| `hrm.departments.view` | **X** | **X** | **X** | **X** | **X** |
| `hrm.departments.manage` | **X** | **X** | - | - | - |
| `hrm.positions.view` | **X** | **X** | **X** | **X** | **X** |
| `hrm.positions.manage` | **X** | **X** | - | - | - |
| `hrm.employees.view` | **X** | **X** | **X** (Nhóm) | **X** (Cơ bản) | **X** (Cơ bản) |
| `hrm.employees.view_sensitive` | **X** | **X** | - | - | - |
| `hrm.employees.manage` | **X** | **X** | - | - | - |
| `hrm.contracts.manage` | **X** | **X** | - | - | - |
| `hrm.attendance.clock` | **X** | **X** | **X** | **X** | **X** |
| `hrm.attendance.view_my` | **X** | **X** | **X** | **X** | **X** |
| `hrm.attendance.view_all` | **X** | **X** | **X** (Bộ phận) | - | - |
| `hrm.attendance.manage` | **X** | **X** | - | - | - |
| `hrm.leave.request` | **X** | **X** | **X** | **X** | **X** |
| `hrm.leave.approve` | **X** | **X** | **X** (Cấp dưới) | - | - |
| `hrm.leave.manage` | **X** | **X** | - | - | - |

---

## 3. CƠ CHẾ BẢO VỆ TẦNG MÃ NGUỒN (CODE ENFORCEMENT)

1. **Bộ lọc bảo vệ Function-Level RBAC:**
   Tất cả Controller Methods của `HrmController` đều được gắn:
   ```typescript
   @UseGuards(PermissionsGuard)
   @RequirePermissions('hrm.leave.approve')
   ```
2. **Ngăn chặn nâng đặc quyền (Privilege Escalation Prevention):**
   - Nhân viên không thể tự duyệt đơn nghỉ phép của chính mình (`approverEmployeeId != employeeId`).
   - Mọi thao tác xem/sửa hồ sơ nhân sự đều lọc theo `organization_id` do JWT cung cấp, triệt tiêu nguy cơ IDOR (Insecure Direct Object References).
