# BÁO CÁO XÁC MINH PHÂN QUYỀN RBAC: PHASE 2F — HRM
**(PHASE 2F ROLE-BASED ACCESS CONTROL VERIFICATION REPORT)**

**Mã tài liệu:** `docs/PHASE_2F_RBAC_VERIFICATION_REPORT.md`  
**Dự án:** BizPro+ Modular Enterprise ERP & Business Management System  
**Ngày ban hành:** 06/11/2026  
**Chuyên gia thực hiện:** Principal Security Architect & RBAC Specialist  
**Kính gửi:** Senior Technical Lead & Code Auditor (ChatGPT)  
**Trạng thái:** **RBAC VERIFICATION — PASS (15 PERMISSIONS × 5 ROLES)**

---

## 1. DANH MỤC 15 QUYỀN HRM ĐÃ CẬP NHẬT VÀO HỆ THỐNG

| STT | Mã Quyền | Phân hệ | Hành động | Mô tả |
|:---:|:---|:---:|:---:|:---|
| 01 | `hrm.departments.view` | HRM | READ | Xem cơ cấu phòng ban |
| 02 | `hrm.departments.manage` | HRM | MANAGE | Quản trị phòng ban (Thêm, sửa, xóa) |
| 03 | `hrm.positions.view` | HRM | READ | Xem danh mục chức vụ |
| 04 | `hrm.positions.manage` | HRM | MANAGE | Quản trị danh mục chức vụ |
| 05 | `hrm.employees.view` | HRM | READ | Xem hồ sơ nhân sự |
| 06 | `hrm.employees.view_sensitive` | HRM | READ | Xem thông tin lương và hợp đồng nhân sự |
| 07 | `hrm.employees.manage` | HRM | MANAGE | Tiếp nhận và quản trị nhân sự |
| 08 | `hrm.contracts.manage` | HRM | MANAGE | Quản lý hợp đồng lao động |
| 09 | `hrm.attendance.clock` | HRM | CREATE | Tự chấm công Check-in / Check-out |
| 10 | `hrm.attendance.view_my` | HRM | READ | Xem bảng công cá nhân |
| 11 | `hrm.attendance.view_all` | HRM | READ | Xem bảng công toàn tổ chức |
| 12 | `hrm.attendance.manage` | HRM | MANAGE | Điều chỉnh bản ghi chấm công (HR) |
| 13 | `hrm.leave.request` | HRM | CREATE | Nộp đơn xin nghỉ phép và xem số dư phép |
| 14 | `hrm.leave.approve` | HRM | MANAGE | Phê duyệt đơn xin nghỉ phép cấp dưới |
| 15 | `hrm.leave.manage` | HRM | MANAGE | Quản trị quỹ ngày phép và loại nghỉ phép |

---

## 2. MA TRẬN PHÂN QUYỀN VAI TRÒ THỰC TẾ (SEEDING VERIFICATION)

1. **SUPER_ADMIN & ORG_ADMIN:** Toàn quyền 15/15 quyền HRM.
2. **HR_MANAGER:** Toàn quyền 15/15 quyền nghiệp vụ HRM.
3. **MANAGER (Trưởng phòng):** `hrm.departments.view`, `hrm.positions.view`, `hrm.employees.view`, `hrm.attendance.clock`, `hrm.attendance.view_my`, `hrm.attendance.view_all`, `hrm.leave.request`, `hrm.leave.approve`.
4. **EMPLOYEE (Nhân viên tiêu chuẩn):** `hrm.departments.view`, `hrm.positions.view`, `hrm.employees.view`, `hrm.attendance.clock`, `hrm.attendance.view_my`, `hrm.leave.request`.

---

## 3. CƠ CHẾ BẢO VỆ CHỐNG IDOR VÀ TỰ PHÊ DUYỆT (ANTI-SELF-APPROVAL)

- **Anti-Self-Approval Guard:**
  Tại `HrmService.approveLeaveRequest`:
  ```typescript
  const approverEmployee = await this.getEmployeeForUser(tx, orgId, approverUserId);
  if (approverEmployee && approverEmployee.id === req.employee_id) {
    throw new BadRequestException('Nhân viên không thể tự phê duyệt đơn xin nghỉ phép của chính mình');
  }
  ```
  Ngăn chặn tuyệt đối việc người duyệt tự tạo đơn và tự ký duyệt cho chính mình.
- **RBAC Function Guard:** Nhân viên không có quyền `hrm.leave.approve` khi gọi API `/approve` bị chặn ngay lập tức với mã lỗi `403 Forbidden` (`TC-HRM-09`).
- **Anti-IDOR:** Mọi truy vấn đọc/ghi bản ghi nghỉ phép, chấm công, nhân sự đều bắt buộc khớp `organization_id` do JWT cung cấp.
