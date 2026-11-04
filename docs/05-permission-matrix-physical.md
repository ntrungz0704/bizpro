# PHYSICAL PERMISSION MATRIX SPECIFICATION (MA TRẬN PHÂN QUYỀN VẬT LÝ CHI TIẾT)
## BUSINESS MANAGEMENT SYSTEM (RBAC + DATA SCOPE ENGINE)
**Phiên bản:** 1.0  
**Cấu trúc Permission Code:** `<module>.<resource>.<action>`  
**Phạm vi dữ liệu (Data Scope):**
- `OWN`: Chỉ dữ liệu do chính User tạo ra hoặc được chỉ định phân công phụ trách.
- `DEPARTMENT`: Dữ liệu thuộc phòng ban của User và các phòng ban cấp dưới trực thuộc.
- `ALL`: Toàn bộ dữ liệu của Tổ chức (Organization).

---

## 1. BẢNG DANH MỤC QUYỀN NĂNG HỆ THỐNG (SYSTEM PERMISSIONS CATALOG)

| STT | Permission Code | Module | Action | Mô tả chi tiết nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| **I** | **SYSTEM & ADMINISTRATION** | | | |
| 1 | `system.organizations.read` | SYSTEM | READ | Xem thông tin hồ sơ tổ chức |
| 2 | `system.organizations.update`| SYSTEM | UPDATE | Cập nhật cấu hình công ty, logo, múi giờ |
| 3 | `system.users.read` | SYSTEM | READ | Xem danh sách tài khoản người dùng |
| 4 | `system.users.create` | SYSTEM | CREATE | Tạo mới tài khoản và mời vào tổ chức |
| 5 | `system.users.update` | SYSTEM | UPDATE | Sửa thông tin tài khoản, đặt lại mật khẩu |
| 6 | `system.users.delete` | SYSTEM | DELETE | Khóa hoặc vô hiệu hóa tài khoản |
| 7 | `system.roles.read` | SYSTEM | READ | Xem danh sách vai trò và bảng quyền |
| 8 | `system.roles.manage` | SYSTEM | MANAGE | Tạo, sửa vai trò và phân quyền (Permissions) |
| 9 | `system.audit_logs.read` | SYSTEM | READ | Xem và tra cứu nhật ký kiểm toán hệ thống |
| **II**| **CRM MODULE** | | | |
| 10 | `crm.leads.read` | CRM | READ | Xem danh sách khách hàng tiềm năng |
| 11 | `crm.leads.create` | CRM | CREATE | Tạo mới khách hàng tiềm năng |
| 12 | `crm.leads.update` | CRM | UPDATE | Chỉnh sửa thông tin khách hàng tiềm năng |
| 13 | `crm.leads.delete` | CRM | DELETE | Xóa hoặc lưu trữ khách hàng tiềm năng |
| 14 | `crm.leads.convert` | CRM | CONVERT | Thực hiện quy trình chuyển đổi Lead thành Khách hàng |
| 15 | `crm.customers.read` | CRM | READ | Xem danh sách và chi tiết khách hàng |
| 16 | `crm.customers.create` | CRM | CREATE | Thêm mới khách hàng cá nhân / doanh nghiệp |
| 17 | `crm.customers.update` | CRM | UPDATE | Chỉnh sửa thông tin khách hàng, địa chỉ, MST |
| 18 | `crm.customers.delete` | CRM | DELETE | Vô hiệu hóa hoặc ngừng giao dịch khách hàng |
| 19 | `crm.contacts.manage` | CRM | MANAGE | Quản lý người liên hệ đại diện của đối tác |
| 20 | `crm.deals.read` | CRM | READ | Xem các cơ hội kinh doanh trên Pipeline |
| 21 | `crm.deals.create` | CRM | CREATE | Mở cơ hội kinh doanh mới |
| 22 | `crm.deals.update` | CRM | UPDATE | Cập nhật giá trị, ngày chốt, kéo thả stage Deal |
| 23 | `crm.deals.delete` | CRM | DELETE | Hủy hoặc xóa cơ hội kinh doanh |
| 24 | `crm.activities.manage` | CRM | MANAGE | Ghi nhật ký cuộc gọi, lịch họp, tạo task chăm sóc |
| 25 | `crm.pipelines.manage` | CRM | MANAGE | Cấu hình số giai đoạn và quy trình bán hàng |
| **III**| **INVENTORY MODULE** | | | |
| 26 | `inventory.products.read` | INVENTORY | READ | Xem danh mục sản phẩm, bảng giá và tồn kho |
| 27 | `inventory.products.manage` | INVENTORY | MANAGE | Thêm mới, chỉnh sửa sản phẩm, mã vạch, SKU, ĐVT |
| 28 | `inventory.warehouses.read` | INVENTORY | READ | Xem danh sách các kho hàng |
| 29 | `inventory.warehouses.manage`| INVENTORY | MANAGE | Khởi tạo kho mới, sửa địa chỉ, gán thủ kho |
| 30 | `inventory.balances.read` | INVENTORY | READ | Xem chi tiết số dư tồn thực tế, đang giữ, khả dụng |
| 31 | `inventory.receipts.read` | INVENTORY | READ | Xem danh sách phiếu nhập kho |
| 32 | `inventory.receipts.create` | INVENTORY | CREATE | Lập phiếu nhập kho nháp |
| 33 | `inventory.receipts.post` | INVENTORY | POST | Xác nhận ghi sổ nhập kho (Tăng tồn thực tế) |
| 34 | `inventory.receipts.cancel` | INVENTORY | CANCEL | Hủy phiếu nhập kho nháp |
| 35 | `inventory.issues.read` | INVENTORY | READ | Xem danh sách phiếu xuất kho |
| 36 | `inventory.issues.create` | INVENTORY | CREATE | Lập phiếu xuất kho nháp |
| 37 | `inventory.issues.post` | INVENTORY | POST | Xác nhận xuất kho ghi sổ (Giảm tồn thực tế) |
| 38 | `inventory.issues.cancel` | INVENTORY | CANCEL | Hủy phiếu xuất kho nháp |
| 39 | `inventory.transfers.read` | INVENTORY | READ | Xem phiếu chuyển kho liên chi nhánh |
| 40 | `inventory.transfers.create`| INVENTORY | CREATE | Lập lệnh chuyển kho |
| 41 | `inventory.transfers.post` | INVENTORY | POST | Xác nhận đã nhận hàng tại kho đích |
| 42 | `inventory.stocktakes.manage`| INVENTORY| MANAGE | Khởi tạo và ghi nhận kết quả kiểm kê kho |
| 43 | `inventory.adjustments.approve`| INVENTORY| APPROVE| Duyệt phiếu điều chỉnh chênh lệch tồn kho |
| 44 | `inventory.transactions.read`| INVENTORY| READ | Xem sổ cái biến động kho bất biến |
| **IV**| **SALES ORDER MODULE** | | | |
| 45 | `sales.orders.read` | SALES | READ | Xem danh sách và chi tiết đơn hàng |
| 46 | `sales.orders.create` | SALES | CREATE | Lập đơn bán hàng mới ở trạng thái Draft |
| 47 | `sales.orders.update` | SALES | UPDATE | Chỉnh sửa sản phẩm, số lượng, giá đơn Draft |
| 48 | `sales.orders.confirm` | SALES | CONFIRM | Duyệt đơn bán hàng (Kích hoạt Giữ hàng trong kho) |
| 49 | `sales.orders.fulfill` | SALES | FULFILL | Tạo phiếu xuất kho hoàn tất đơn hàng |
| 50 | `sales.orders.cancel` | SALES | CANCEL | Hủy đơn hàng và giải phóng số lượng giữ kho |
| **V** | **HRM MODULE** | | | |
| 51 | `hrm.departments.read` | HRM | READ | Xem cơ cấu phòng ban |
| 52 | `hrm.departments.manage` | HRM | MANAGE | Tạo mới, sắp xếp cây phòng ban, bổ nhiệm trưởng phòng |
| 53 | `hrm.positions.manage` | HRM | MANAGE | Quản lý danh mục chức danh chức vụ |
| 54 | `hrm.employees.read` | HRM | READ | Xem danh sách và lý lịch nhân viên |
| 55 | `hrm.employees.manage` | HRM | MANAGE | Tiếp nhận nhân viên, cập nhật hồ sơ, điều chuyển |
| 56 | `hrm.contracts.read` | HRM | READ | Xem thông tin hợp đồng lao động và mức lương |
| 57 | `hrm.contracts.manage` | HRM | MANAGE | Ký mới, gia hạn, chấm dứt hợp đồng lao động |
| 58 | `hrm.attendance.checkin` | HRM | CHECKIN | Thực hiện chấm công hàng ngày cho bản thân |
| 59 | `hrm.attendance.read` | HRM | READ | Xem bảng chấm công tổng hợp |
| 60 | `hrm.attendance.adjust` | HRM | ADJUST | Điều chỉnh dữ liệu công và duyệt giải trình |
| 61 | `hrm.leave.request` | HRM | REQUEST | Gửi đơn xin nghỉ phép cá nhân |
| 62 | `hrm.leave.approve` | HRM | APPROVE | Phê duyệt hoặc từ chối đơn xin nghỉ phép |
| 63 | `hrm.leave.manage_quota` | HRM | MANAGE | Cấp phát và điều chỉnh hạn mức ngày phép năm |
| **VI**| **DASHBOARD & REPORTS** | | | |
| 64 | `dashboard.sales.read` | REPORTS | READ | Xem báo cáo doanh số, tỷ lệ chốt deal |
| 65 | `dashboard.inventory.read` | REPORTS | READ | Xem báo cáo giá trị tồn kho, cảnh báo hết hàng |
| 66 | `dashboard.hrm.read` | REPORTS | READ | Xem báo cáo biến động nhân sự, tỷ lệ đi làm |

---

## 2. MA TRẬN PHÂN BỔ QUYỀN MẶC ĐỊNH THEO VAI TRÒ (ROLE-PERMISSION MAPPING)

Ký hiệu:
- **`ALL`**: Toàn quyền trên phạm vi toàn công ty/tổ chức.
- **`DEP`**: Chỉ trong phạm vi phòng ban mình quản lý hoặc trực thuộc (`DEPARTMENT`).
- **`OWN`**: Chỉ những bản ghi do chính mình tạo ra hoặc phụ trách.
- **`-`**: Không có quyền.

| Nhóm quyền / Quyền cụ thể | Org Admin | Sales Manager | Sales Staff | Warehouse Manager | Warehouse Staff | HR Manager | HR Staff | Employee |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Quản trị User & Quyền** | `ALL` | - | - | - | - | - | - | - |
| **Nhật ký Audit Log** | `ALL` | - | - | - | - | - | - | - |
| `crm.leads.read/manage` | `ALL` | `DEP` | `OWN` | - | - | - | - | - |
| `crm.leads.convert` | `ALL` | `DEP` | `OWN` | - | - | - | - | - |
| `crm.customers.read` | `ALL` | `ALL` | `ALL` | `ALL` | `ALL` | - | - | - |
| `crm.customers.manage` | `ALL` | `DEP` | `OWN` | - | - | - | - | - |
| `crm.deals.read/manage` | `ALL` | `DEP` | `OWN` | - | - | - | - | - |
| `inventory.products.manage`| `ALL` | - | - | `ALL` | - | - | - | - |
| `inventory.balances.read` | `ALL` | `ALL` | `ALL` | `ALL` | `ALL` | - | - | - |
| `inventory.receipts.create`| `ALL` | - | - | `ALL` | `ALL` | - | - | - |
| `inventory.receipts.post` | `ALL` | - | - | `ALL` | - | - | - | - |
| `inventory.issues.create` | `ALL` | - | - | `ALL` | `ALL` | - | - | - |
| `inventory.issues.post` | `ALL` | - | - | `ALL` | - | - | - | - |
| `inventory.adjustments.approve`| `ALL` | - | - | `ALL` | - | - | - | - |
| `sales.orders.create` | `ALL` | `DEP` | `OWN` | - | - | - | - | - |
| `sales.orders.confirm` | `ALL` | `DEP` | - | - | - | - | - | - |
| `sales.orders.fulfill` | `ALL` | - | - | `ALL` | `ALL` | - | - | - |
| `sales.orders.cancel` | `ALL` | `DEP` | `OWN*` | - | - | - | - | - |
| `hrm.employees.manage` | `ALL` | - | - | - | - | `ALL` | `ALL` | - |
| `hrm.contracts.manage` | `ALL` | - | - | - | - | `ALL` | - | - |
| `hrm.attendance.checkin` | `ALL` | `OWN` | `OWN` | `OWN` | `OWN` | `OWN` | `OWN` | `OWN` |
| `hrm.attendance.adjust` | `ALL` | `DEP` | - | `DEP` | - | `ALL` | `ALL` | - |
| `hrm.leave.request` | `ALL` | `OWN` | `OWN` | `OWN` | `OWN` | `OWN` | `OWN` | `OWN` |
| `hrm.leave.approve` | `ALL` | `DEP` | - | `DEP` | - | `ALL` | - | - |
| `dashboard.sales.read` | `ALL` | `DEP` | `OWN` | - | - | - | - | - |
| `dashboard.inventory.read` | `ALL` | `ALL` | `ALL` | `ALL` | `ALL` | - | - | - |
| `dashboard.hrm.read` | `ALL` | `DEP` | - | `DEP` | - | `ALL` | `DEP` | - |

*(Ghi chú: `OWN*` đối với hủy đơn hàng chỉ cho phép nhân viên kinh doanh hủy khi đơn đang ở trạng thái `DRAFT`).*
