# MODULE AUDIT MATRIX: BIZPRO+
**KIỂM TOÁN CHI TIẾT TỪNG PHÂN HỆ VÀ TÍNH NĂNG (FEATURE-BY-FEATURE EVIDENCE AUDIT)**

* **Quy chuẩn đánh giá:** Codebase Auditor Protocol (Dựa trên bằng chứng tệp tin, dòng mã, endpoint và lệnh chạy thực tế)
* **Hệ thống 7 nhãn phân loại:**
  * ✅ `VERIFIED_COMPLETE`: Đã code đủ từ UI $\rightarrow$ API $\rightarrow$ DB Transaction $\rightarrow$ Có test pass thực tế.
  * 🟡 `PARTIALLY_IMPLEMENTED`: Đã có luồng nhưng thiếu validate, thiếu bước hoặc chỉ có một tầng.
  * 🎨 `UI_ONLY`: Mới chỉ có giao diện tĩnh, nút bấm có hiệu ứng hoặc alert, chưa kết nối logic lưu trữ.
  * 💾 `MOCK_DATA`: Đã lập trình logic và phản xạ dữ liệu nhưng chỉ chạy trên RAM (`AppContext.tsx`), mất sạch khi F5.
  * 🔴 `BROKEN`: Code lỗi, không thể chạy, import hỏng hoặc lỗi logic nghiêm trọng.
  * ⚪ `NOT_IMPLEMENTED`: Chưa lập trình bất kỳ dòng mã nào.
  * ⛔ `BLOCKED`: Bị nghẽn do phụ thuộc vào module khác chưa hoàn thành.

---

## BẢNG KIỂM TOÁN TỔNG HỢP

| Phân hệ (Module) | Tính năng cụ thể | Frontend (Mã nguồn) | Backend (API/Controller) | Database (Schema & Migration) | Automated Tests | Trạng thái kỹ thuật | Bằng chứng & Phân tích chi tiết |
|---|---|---|---|---|:---:|:---:|---|
| **System Core** | Đăng nhập / Đăng xuất (Auth) | ⚪ Chưa có trang Login | ⚪ Chưa có Auth Module | 🟡 Đã có model `users`, `sessions` trong `schema.prisma:103-128` | ⚪ 0 | `NOT_IMPLEMENTED` | Người dùng vào thẳng Dashboard không qua xác thực; không có JWT token hay Cookie session. |
| **System Core** | Quản lý Đa tổ chức (Multi-tenancy) | ⚪ Chưa có bộ chọn Organization | ⚪ Chưa có Tenant Interceptor | 🟡 Cột `organization_id` đã định nghĩa trên 50 model | ⚪ 0 | `NOT_IMPLEMENTED` | Chưa có middleware tự động cô lập truy vấn theo tenant. |
| **System Core** | Phân quyền RBAC & Scope | 🎨 Bảng vai trò hiển thị tại `settings/page.tsx:142-205` | ⚪ Chưa có Guard / Decorator kiểm tra quyền | 🟡 Đã có model `roles`, `permissions`, `role_permissions` (`schema.prisma:150-190`) | ⚪ 0 | `UI_ONLY` | Mới hiển thị danh sách quyền dưới dạng thẻ tĩnh, không áp dụng kiểm soát quyền thực tế. |
| **System Core** | Nhật ký hoạt động (Audit Trail) | 💾 Bảng hiển thị log tại `settings/page.tsx:210-250` và `RecentActivities.tsx` | ⚪ Chưa có Interceptor tự động bắt Diff | 🟡 Đã có model `audit_logs` (`schema.prisma:220-235`) | ⚪ 0 | `MOCK_DATA` | Mới ghi log vào mảng RAM `activities` trong `AppContext.tsx:595-605`, biến mất khi reload. |
| **CRM** | Quản lý Khách hàng (Customers) | 💾 `crm/customers/page.tsx` (Bảng, tìm kiếm, modal tạo) | ⚪ Chưa có `CustomersController` | 🟡 Model `customers` (`schema.prisma:250-280`) | ⚪ 0 | `MOCK_DATA` | Thêm khách hàng cập nhật danh sách trên RAM, tính doanh thu và công nợ cục bộ. |
| **CRM** | Khách hàng tiềm năng (Leads) | 💾 `crm/leads/page.tsx` (Lọc nguồn, phụ trách, modal) | ⚪ Chưa có `LeadsController` | 🟡 Model `leads` (`schema.prisma:290-320`) | ⚪ 0 | `MOCK_DATA` | Quản lý danh sách Lead in-memory, có trường nguồn và nhân viên phụ trách. |
| **CRM** | Chuyển đổi Lead $\rightarrow$ Customer | 💾 Nút "Chuyển đổi" tại `crm/leads/page.tsx:145` | ⚪ Chưa có transaction API | 🟡 Enum `LeadStatus.CONVERTED` (`schema.prisma:25`) | ⚪ 0 | `MOCK_DATA` | Hàm `convertLead` (`AppContext.tsx:645-660`) đổi status thành `CONVERTED` và push sang mảng `customers`. Chưa kiểm tra trùng số điện thoại/email thực tế trên CSDL. |
| **CRM** | Cơ hội & Phễu (Deals & Pipeline) | 💾 `crm/deals/page.tsx` (Kanban 7 cột, Won/Lost) | ⚪ Chưa có `DealsController` | 🟡 Model `deals`, `pipelines`, `pipeline_stages` (`schema.prisma:330-365`) | ⚪ 0 | `MOCK_DATA` | Kéo thả chuyển trạng thái Deal và đếm tổng giá trị mỗi cột chạy mượt trong React state. |
| **Inventory** | Danh mục Sản phẩm & SKU | 💾 `inventory/products/page.tsx` (Bảng, lọc nhóm, modal) | ⚪ Chưa có `ProductsController` | 🟡 Model `products`, `product_categories`, `units_of_measure` (`schema.prisma:380-420`) | ⚪ 0 | `MOCK_DATA` | Hiển thị SKU, giá vốn, giá bán, tồn kho. Thêm sản phẩm cập nhật ngay vào bảng in-memory. |
| **Inventory** | Tồn khả dụng (`OnHand - Reserved`)| 💾 Cột "Khả dụng" tại `products/page.tsx:132-143` | ⚪ Chưa có Service tính toán | 🟡 Model `inventory_balances` (`schema.prisma:430-450`) | ⚪ 0 | `MOCK_DATA` | Công thức `available = prod.onHand - prod.reserved` được tính toán chính xác trên UI và Context RAM. |
| **Inventory** | Nhập kho (Goods Receipts) | 💾 `inventory/receipts-issues/page.tsx:70-165` | ⚪ Chưa có API Ghi sổ | 🟡 Model `stock_receipts`, `stock_receipt_items` (`schema.prisma:460-490`) | ⚪ 0 | `MOCK_DATA` | Nút "Ghi sổ (Tăng tồn)" gọi `postStockReceipt` (`AppContext.tsx:770`) tăng `onHand` của sản phẩm trong RAM. |
| **Inventory** | Xuất kho (Goods Issues) | 💾 `inventory/receipts-issues/page.tsx:170-205` | ⚪ Chưa có API Xuất kho | 🟡 Model `stock_issues`, `stock_issue_items` (`schema.prisma:500-530`) | ⚪ 0 | `MOCK_DATA` | Xem lịch sử các phiếu xuất kho được tự động sinh ra khi đơn bán hàng Fulfill. |
| **Inventory** | Kiểm kê & Cân bằng tồn (Stocktakes)| 💾 `inventory/stocktakes/page.tsx:1-150` | ⚪ Chưa có API Cân bằng kho | 🟡 Model `stocktakes`, `stocktake_items` (`schema.prisma:540-575`) | ⚪ 0 | `MOCK_DATA` | Bảng tính độ lệch (Variance) giữa số lượng hệ thống và số lượng đếm thực tế. |
| **Inventory** | Sổ cái kho bất biến (Stock Ledger)| ⚪ Chưa có giao diện sổ cái chi tiết | ⚪ Chưa có Service ghi log giao dịch | 🟡 Model `inventory_transactions` (`schema.prisma:580-610`) | ⚪ 0 | `NOT_IMPLEMENTED` | Chưa có cơ chế ghi nhận nhật ký mọi lần xuất nhập kho vào bảng bất biến. |
| **Sales Orders**| Tạo Đơn bán hàng mới | 💾 Modal tạo đơn tại `sales/orders/page.tsx:280-380` | ⚪ Chưa có `OrdersController` | 🟡 Model `sales_orders`, `sales_order_items` (`schema.prisma:630-675`) | ⚪ 0 | `MOCK_DATA` | Cho phép chọn sản phẩm, chọn khách hàng, tự động kiểm tra xem số lượng đặt có vượt tồn khả dụng hay không. |
| **Sales Orders**| Xác nhận đơn & Giữ hàng (Confirm)| 💾 Nút "Xác nhận (Giữ hàng)" tại `sales/orders/page.tsx:224` | ⚪ Chưa có Lock Transaction | 🟡 Model `stock_reservations` (`schema.prisma:680-705`) | ⚪ 0 | `MOCK_DATA` | Hàm `confirmSalesOrder` (`AppContext.tsx:710-730`) tăng `prod.reserved` tương ứng với số lượng trong đơn. |
| **Sales Orders**| Xuất kho đơn hàng (Fulfill) | 💾 Nút "Xuất kho" tại `sales/orders/page.tsx:234` | ⚪ Chưa có Lock Transaction | 🟡 Model `stock_issues` (`schema.prisma:500`) | ⚪ 0 | `MOCK_DATA` | Hàm `fulfillSalesOrder` (`AppContext.tsx:735-755`) giảm `prod.onHand` và `prod.reserved`, chuyển đơn sang `FULFILLED`. |
| **Sales Orders**| Hủy đơn hàng (Cancel) | 💾 Nút "Hủy đơn" tại `sales/orders/page.tsx:244` | ⚪ Chưa có Logic giải phóng tồn | 🟡 Enum `SalesOrderStatus.CANCELLED` (`schema.prisma:93`) | ⚪ 0 | `MOCK_DATA` | Hàm `cancelSalesOrder` (`AppContext.tsx:760-768`) nhả lượng tồn đang giữ và chuyển trạng thái thành `CANCELLED`. |
| **HRM** | Quản lý Nhân viên & Phòng ban | 💾 `hrm/employees/page.tsx` (Danh bạ, bộ lọc, modal) | ⚪ Chưa có `EmployeesController` | 🟡 Model `employees`, `departments`, `positions` (`schema.prisma:720-770`) | ⚪ 0 | `MOCK_DATA` | Quản lý hồ sơ nhân viên, mã nhân viên, phòng ban, chức vụ, tình trạng công tác. |
| **HRM** | Chấm công số hóa (Attendance) | 💾 `hrm/attendance/page.tsx` (Đồng hồ, Check-in/out) | ⚪ Chưa có API Chấm công | 🟡 Model `attendance_records` (`schema.prisma:780-805`) | ⚪ 0 | `MOCK_DATA` | Bấm Check-in ghi nhận giờ vào, Check-out ghi nhận giờ ra và tính toán tổng số giờ làm việc trong ngày. |
| **HRM** | Quản lý Nghỉ phép (Leave Mgmt) | 💾 `hrm/leave/page.tsx` (Thẻ ngày phép, đơn xin, duyệt) | ⚪ Chưa có API Duyệt nghỉ | 🟡 Model `leave_requests`, `leave_balances` (`schema.prisma:810-845`) | ⚪ 0 | `MOCK_DATA` | Nhân viên nộp đơn $\rightarrow$ Trưởng phòng bấm "Duyệt" hoặc "Từ chối" cập nhật ngay lập tức. |
| **Reporting** | Dashboard KPI tổng quan | 💾 `app/page.tsx:1-150` (4 KPI, 2 Chart, Funnel, Alerts) | ⚪ Chưa có API Aggregation | 🟡 Dữ liệu cần aggregate từ 50 bảng Prisma | ⚪ 0 | `MOCK_DATA` | Dashboard đồng bộ động với mọi thay đổi của Đơn hàng, Tồn kho, Nhân sự và Cơ hội. |
| **Reporting** | Xuất dữ liệu Excel & In ấn | 🎨 Nút bấm tại `reports/page.tsx:55-75` | ⚪ Chưa có Worker tạo file Excel/PDF | ⚪ Không có schema riêng | ⚪ 0 | `UI_ONLY` | Hiện tại mới chỉ hiện hộp thoại `alert("Chức năng đang khởi tạo file...")`. |

---

## TỔNG KẾT BẰNG CHỨNG KIỂM TOÁN (AUDIT VERDICT)

* **Tổng số tính năng được kiểm toán:** 23 tính năng cốt lõi.
* **Số tính năng đạt chuẩn VERIFIED_COMPLETE (End-to-End có DB & Test):** `0 / 23 (0.0%)`.
* **Số tính năng đạt chuẩn MOCK_DATA (Giao diện hoàn chỉnh + Logic in-memory đầy đủ):** `18 / 23 (78.3%)`.
* **Số tính năng đạt chuẩn UI_ONLY (Chỉ có giao diện tĩnh, chưa có logic xử lý):** `2 / 23 (8.7%)`.
* **Số tính năng đạt chuẩn NOT_IMPLEMENTED (Chưa lập trình):** `3 / 23 (13.0%)`.
* **Tổng kiểm tra toàn diện:** `0 + 18 + 2 + 3 = 23 / 23 (100.0%)`.

> [!IMPORTANT]
> **Nhận định của Lead Technical Auditor:**
> Dự án đã vượt qua giai đoạn tạo mẫu giao diện (Frontend Prototyping) với chất lượng UI/UX rất cao. Tuy nhiên, để hệ thống có thể vận hành trong thực tế (Production-Ready), toàn bộ tầng Backend (NestJS), Cơ sở dữ liệu (PostgreSQL) và các Ràng buộc bất biến (Business Invariants) phải được xây dựng thực chất, không được tiếp tục dựa vào trạng thái giả lập trên trình duyệt.
