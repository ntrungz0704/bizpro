# NHẬT KÝ QUYẾT ĐỊNH KIẾN TRÚC: PHASE 2E SALES ORDERS & FULFILLMENT
**(PHASE 2E ARCHITECTURAL DECISION LOG)**

**Dự án**: BizPro+ Modular Enterprise ERP & Business Management System  
**Mã tài liệu**: `docs/PHASE_2E_DECISION_LOG.md`  
**Ngày ban hành**: 06/11/2026  
**Chuyên gia thực hiện**: Principal Architect & Senior Technical Lead  
**Kính gửi**: Senior Technical Lead & Code Auditor (ChatGPT)  
**Trạng thái**: **DESIGN SPECIFICATION — SẴN SÀNG CHỜ PHÊ DUYỆT (STEP 1)**

---

## 1. TỔNG QUAN

Tài liệu này ghi lại các Quyết định Kiến trúc Trọng yếu (Architectural Decision Records — ADR) được thiết lập cho Phase 2E: Sales Orders & Fulfillment nhằm bảo đảm tính bền vững, toàn vẹn dữ liệu và phòng thủ đa tầng của hệ thống ERP BizPro+.

---

## 2. DANH MỤC CÁC QUYẾT ĐỊNH KIẾN TRÚC (ADR REGISTER)

### ADR-2E-01: Cơ Chế Khóa Giữ Tồn Kho (Stock Reservation Strategy)
* **Bối cảnh**: Khi khách hàng đặt đơn và nhân viên xác nhận đơn hàng, hàng hóa chưa rời khỏi kho vật lý nhưng không được phép bán tiếp cho đơn hàng khác.
* **Quyết định**:
  - Không tạo một cột dư thừa `reserved_quantity` trên bảng `stock_balances` để tránh nguy cơ sai lệch số dư (desynchronization).
  - Sử dụng bảng riêng biệt `inventory_reservations` với trạng thái `ACTIVE`, `RELEASED`, `FULFILLED`.
  - Công thức tính Tồn khả dụng (Available Stock):
    $$\text{Available Stock} = \text{On-Hand Stock} - \sum \text{Active Reservations}$$
* **Hệ quả**: Đảm bảo tính nhất quán tuyệt đối, có khả năng truy vết chính xác đơn hàng nào đang giữ mặt hàng nào trong kho.

---

### ADR-2E-02: Tích Hợp Xuất Kho Giao Hàng Qua Phân Hệ Inventory Core (Single SOT)
* **Bối cảnh**: Khi giao hàng cho khách, hệ thống cần thực hiện giảm tồn kho thực tế và ghi nhận vào thẻ kho.
* **Quyết định**:
  - Module Sales **tuyệt đối không tự ý cập nhật** trực tiếp vào `stock_balances` hoặc `stock_ledger` bằng các câu lệnh UPDATE tùy tiện.
  - Module Sales bắt buộc tích hợp với workflow `StockIssue` (Phiếu xuất kho) của Phase 2C Inventory Core đã được nghiệm thu.
  - Mỗi bản ghi `Fulfillment` lưu trữ khóa ngoại `stockIssueId` liên kết 1-1 với `StockIssue` tương ứng.
* **Hệ quả**: Giữ vững nguyên tắc Single Source of Truth cho toàn bộ nghiệp vụ kho, bảo đảm thẻ kho hai chiều ghi nhận minh bạch.

---

### ADR-2E-03: Áp Dụng Phân Quyền Chức Năng Ngay Từ Đầu (Upfront RBAC Enforcement)
* **Bối cảnh**: Tại Phase 2D (CRM), việc phân quyền mới áp dụng ở mức độ Tenant Context & Object-Level Isolation, các endpoint controller chưa được gắn `@RequirePermissions(...)`, dẫn đến Managed Risk MR-02.
* **Quyết định**:
  - Module Sales là nghiệp vụ tài chính và kho hàng trọng yếu, do đó **100% các endpoint trong SalesController bắt buộc phải được bảo vệ bởi PermissionsGuard và @RequirePermissions ngay từ ngày đầu tiên**.
  - Không trì hoãn việc gắn Guard chức năng sang Phase 2G.
  - Khai báo 5 quyền chuẩn: `sales.orders.read`, `sales.orders.write`, `sales.orders.confirm`, `sales.orders.cancel`, `sales.fulfillment.manage`.
* **Hệ quả**: Triệt tiêu hoàn toàn nguy cơ leo thang đặc quyền nội bộ (Privilege Escalation), ngăn chặn nhân viên thông thường tự ý duyệt đơn hoặc xuất hàng.

---

### ADR-2E-04: Tính Toán Tài Chính & Số Lượng Bằng Decimal Tuyệt Đối (No Float Policy)
* **Bối cảnh**: Phép tính tiền tệ và số lượng trong JavaScript dễ bị lỗi làm tròn IEEE 754 (ví dụ `0.1 + 0.2 = 0.30000000000000004`).
* **Quyết định**:
  - Toàn bộ các trường tiền tệ (`subtotal`, `discountAmount`, `taxAmount`, `totalAmount`, `unitPrice`) sử dụng kiểu `Decimal(15, 2)` của Prisma/PostgreSQL.
  - Toàn bộ số lượng hàng hóa sử dụng kiểu `Decimal(12, 3)`.
  - Mọi phép tính toán số học ở Backend sử dụng thư viện `decimal.js`.
* **Hệ quả**: Sai số kế toán bằng 0, độ chính xác tài chính đạt chuẩn kiểm toán doanh nghiệp.

---

### ADR-2E-05: Kiểm Soát Concurrency & Phòng Chống Bán Âm Kho Bằng Khóa Dòng Bi Quan
* **Bối cảnh**: Nhiều nhân viên kinh doanh có thể cùng lúc nhấn Xác nhận các đơn hàng khác nhau có chứa cùng một sản phẩm tồn kho có hạn.
* **Quyết định**:
  - Mọi giao dịch xác nhận đơn hàng (`confirm`) và xuất kho (`fulfill`) đều thực thi trong một `prisma.$transaction`.
  - Sử dụng cú pháp `tx.$queryRaw` với `SELECT ... FOR UPDATE` trên các dòng `stock_balances` liên quan trước khi tính toán tồn khả dụng.
  - Nếu số lượng yêu cầu vượt quá tồn khả dụng, lập tức ném ngoại lệ `BadRequestException` và rollback toàn bộ transaction.
* **Hệ quả**: Ngăn chặn 100% tình trạng bán âm kho (Overselling) và Race Condition trong môi trường chịu tải cao.

---

### ADR-2E-06: Chiến Lược Lưu Snapshot Hàng Hóa & Địa Chỉ Giao Hàng
* **Bối cảnh**: Tên sản phẩm, đơn vị tính, đơn giá niêm yết trong danh mục hoặc địa chỉ khách hàng trong CRM có thể thay đổi trong tương lai. Nếu đơn hàng cũ liên kết động qua Foreign Key mà không lưu snapshot, hóa đơn quá khứ sẽ bị sai lệch.
* **Quyết định**:
  - Bảng `sales_order_items` lưu trữ các trường snapshot: `skuSnapshot`, `productNameSnapshot`, `uomSnapshot`, `unitPrice`.
  - Bảng `sales_orders` lưu trữ `shippingAddressSnapshot` dạng JSON kèm các trường bóc tách.
* **Hệ quả**: Đơn hàng mang tính bất biến (Immutable Historic Record), bảo đảm tính pháp lý và kiểm toán tài chính trọn đời.
