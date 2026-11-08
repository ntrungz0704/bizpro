# HỢP ĐỒNG GIAO TIẾP API: PHASE 2E SALES ORDERS & FULFILLMENT
**(PHASE 2E API CONTRACT)**

**Dự án**: BizPro+ Modular Enterprise ERP & Business Management System  
**Mã tài liệu**: `docs/PHASE_2E_API_CONTRACT.md`  
**Ngày ban hành**: 06/11/2026  
**Chuyên gia thực hiện**: Backend Engineer & Principal Architect  
**Kính gửi**: Senior Technical Lead & Code Auditor (ChatGPT)  
**Trạng thái**: **DESIGN SPECIFICATION — SẴN SÀNG CHỜ PHÊ DUYỆT (STEP 1)**

---

## 1. NGUYÊN TẮC THIẾT KẾ RESTFUL & CHUẨN ĐẦU RA

- **Base URL**: `/api/sales`
- **Authentication**: Bắt buộc gắn Header `Authorization: Bearer <access_token>` hoặc Cookie hợp lệ.
- **Tenant Context**: Trích xuất tự động `orgId` và `userId` từ token xác thực. Hệ thống cấm tuyệt đối việc nhận `organizationId` từ body payload hoặc query string của Client gửi lên.
- **RBAC**: Mọi endpoint bắt buộc kiểm tra quyền qua `@UseGuards(PermissionsGuard)` và `@RequirePermissions(...)`.
- **Định dạng dữ liệu**: Toàn bộ Request và Response sử dụng JSON (`application/json`), tiền tệ làm tròn 2 chữ số thập phân, số lượng làm tròn 3 chữ số thập phân.

---

## 2. DANH MỤC ENDPOINTS CHI TIẾT

### 2.1. Quản lý Đơn Bán Hàng (Sales Orders)

#### 1. `POST /api/sales/orders` — Tạo Đơn Hàng Mới (Draft)
- **Quyền yêu cầu**: `sales.orders.write`
- **Mục đích**: Khởi tạo đơn bán hàng ở trạng thái `DRAFT`.
- **Request Body**:
```json
{
  "customerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "warehouseId": "7b123f64-5717-4562-b3fc-2c963f66afa7",
  "dealId": "8c234f64-5717-4562-b3fc-2c963f66afa8",
  "orderDate": "2026-11-06T00:00:00.000Z",
  "expectedDeliveryDate": "2026-11-10",
  "shippingRecipientName": "Nguyễn Văn B",
  "shippingPhone": "0987654321",
  "shippingFullAddress": "Số 123 Đường Cầu Giấy, Hà Nội",
  "note": "Giao hàng giờ hành chính",
  "items": [
    {
      "productId": "9d345f64-5717-4562-b3fc-2c963f66afa9",
      "quantity": 5.000,
      "unitPrice": 1200000.00,
      "discountAmount": 100000.00,
      "taxRate": 10.00
    }
  ]
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "id": "1e456f64-5717-4562-b3fc-2c963f66afb1",
    "orderCode": "SO-20261106-001",
    "status": "DRAFT",
    "paymentStatus": "UNPAID",
    "subtotal": 6000000.00,
    "discountAmount": 100000.00,
    "taxAmount": 590000.00,
    "totalAmount": 6490000.00,
    "itemsCount": 1,
    "createdAt": "2026-11-06T08:30:00.000Z"
  }
}
```
- **Error Codes**:
  - `400 Bad Request`: Thiếu thông tin bắt buộc, số điện thoại không hợp lệ, `quantity <= 0`.
  - `403 Forbidden`: Người dùng không có quyền `sales.orders.write`.
  - `404 Not Found`: Không tìm thấy Customer hoặc Warehouse trong cùng Tenant.

---

#### 2. `GET /api/sales/orders` — Danh Sách Đơn Hàng
- **Quyền yêu cầu**: `sales.orders.read`
- **Query Params**:
  - `search`: string (tìm theo mã đơn, tên khách, số điện thoại)
  - `status`: `DRAFT` | `CONFIRMED` | `PROCESSING` | `PARTIALLY_FULFILLED` | `FULFILLED` | `CANCELLED`
  - `customerId`: UUID
  - `page`: integer (default: 1)
  - `limit`: integer (default: 20)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "1e456f64-5717-4562-b3fc-2c963f66afb1",
        "orderCode": "SO-20261106-001",
        "customer": { "id": "...", "name": "Công ty ABC", "customerCode": "KH-001" },
        "orderDate": "2026-11-06T00:00:00.000Z",
        "status": "CONFIRMED",
        "totalAmount": 6490000.00,
        "itemsCount": 1
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
  }
}
```

---

#### 3. `GET /api/sales/orders/:id` — Chi Tiết Đơn Hàng
- **Quyền yêu cầu**: `sales.orders.read`
- **Response `200 OK`**: Trả về toàn bộ chi tiết đơn hàng, snapshots của items, lịch sử chuyển trạng thái và các đợt giao hàng.
- **Error Codes**: `404 Not Found` nếu không tồn tại hoặc thuộc tổ chức khác (Tenant Isolated).

---

#### 4. `POST /api/sales/orders/:id/confirm` — Xác Nhận Đơn Hàng (Atomic Reservation)
- **Quyền yêu cầu**: `sales.orders.confirm`
- **Mục đích**: Duyệt đơn hàng và khóa giữ hàng trong kho.
- **Header**: `Idempotency-Key: <unique-uuid>` (tùy chọn)
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Đã xác nhận đơn hàng SO-20261106-001 và khóa giữ tồn kho thành công",
  "data": {
    "id": "1e456f64-5717-4562-b3fc-2c963f66afb1",
    "status": "CONFIRMED",
    "confirmedAt": "2026-11-06T08:35:00.000Z",
    "reservations": [
      { "productId": "...", "warehouseId": "...", "quantity": 5.000, "status": "ACTIVE" }
    ]
  }
}
```
- **Error Codes**:
  - `400 Bad Request`: Đơn hàng không ở trạng thái `DRAFT` (hoặc đã xác nhận trước đó).
  - `400 Insufficient Stock`: Tồn khả dụng của kho không đủ để đáp ứng đơn hàng.
  - `404 Not Found`: Không tìm thấy đơn hàng.

---

#### 5. `POST /api/sales/orders/:id/cancel` — Hủy Đơn Hàng (Release Reservation)
- **Quyền yêu cầu**: `sales.orders.cancel`
- **Request Body**:
```json
{
  "reason": "Khách hàng đổi ý hủy đơn"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Đã hủy đơn hàng và giải phóng tồn kho giữ chỗ",
  "data": {
    "id": "1e456f64-5717-4562-b3fc-2c963f66afb1",
    "status": "CANCELLED"
  }
}
```
- **Error Codes**:
  - `400 Bad Request`: Đơn hàng đã ở trạng thái `FULFILLED` (không thể hủy khi đã giao xong).

---

### 2.2. Quản lý Giao Vận (Fulfillment & Stock Issue)

#### 1. `POST /api/sales/orders/:id/fulfill` — Thực Hiện Xuất Kho Giao Hàng
- **Quyền yêu cầu**: `sales.fulfillment.manage`
- **Mục đích**: Xuất hàng giao một phần hoặc toàn bộ, tự động tạo `StockIssue` của Phase 2C.
- **Request Body**:
```json
{
  "warehouseId": "7b123f64-5717-4562-b3fc-2c963f66afa7",
  "carrierName": "Giao Hàng Tiết Kiệm",
  "trackingNumber": "GHTK123456789",
  "note": "Xuất giao đợt 1",
  "items": [
    {
      "productId": "9d345f64-5717-4562-b3fc-2c963f66afa9",
      "quantity": 3.000
    }
  ]
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Xuất kho giao hàng thành công",
  "data": {
    "fulfillmentId": "2f567f64-5717-4562-b3fc-2c963f66afc2",
    "fulfillmentCode": "FF-20261106-001",
    "salesOrderId": "1e456f64-5717-4562-b3fc-2c963f66afb1",
    "salesOrderStatus": "PARTIALLY_FULFILLED",
    "stockIssueCode": "XK-20261106-003",
    "fulfilledItems": [
      {
        "productId": "9d345f64-5717-4562-b3fc-2c963f66afa9",
        "deliveredQuantity": 3.000,
        "remainingQuantity": 2.000
      }
    ]
  }
}
```
- **Error Codes**:
  - `400 Bad Request`: Số lượng giao vượt quá số lượng đặt còn lại.
  - `400 Invalid State`: Đơn hàng chưa được `CONFIRMED` hoặc đang ở trạng thái `CANCELLED`.

---

#### 2. `GET /api/sales/fulfillments` — Danh Sách Phiếu Giao Hàng
- **Quyền yêu cầu**: `sales.orders.read`
- **Query Params**: `orderId`, `page`, `limit`
- **Response `200 OK`**: Danh sách các đợt giao vận kèm mã phiếu xuất kho `stockIssueId`.

---

### 2.3. Báo Cáo & Chỉ Số Tổng Hợp (Sales Dashboard)

#### `GET /api/sales/dashboard` — Chỉ Số Tổng Quan Bán Hàng
- **Quyền yêu cầu**: `sales.orders.read`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "totalOrders": 128,
    "pendingConfirmation": 12,
    "processingDelivery": 8,
    "completedOrders": 102,
    "cancelledOrders": 6,
    "totalRevenue": 845000000.00,
    "fulfillmentRate": 94.4
  }
}
```
- **Công thức tính**:
  - `totalRevenue`: $\sum \text{totalAmount}$ của các đơn có `status = 'FULFILLED'`.
  - `fulfillmentRate`: $\left(\frac{\text{completedOrders}}{\text{totalOrders} - \text{cancelledOrders}}\right) \times 100$.
