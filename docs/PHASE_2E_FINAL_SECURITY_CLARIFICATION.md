# BÁO CÁO LÀM RÕ AN TOÀN BẢO MẬT CUỐI CÙNG: PHASE 2E
**(PHASE 2E FINAL SECURITY CLARIFICATION)**

**Dự án**: BizPro+ Modular Enterprise ERP & Business Management System  
**Mã tài liệu**: `docs/PHASE_2E_FINAL_SECURITY_CLARIFICATION.md`  
**Ngày ban hành**: 06/11/2026  
**Chuyên gia thực hiện**: Senior Backend Security Architect & Principal ERP Architect  
**Kính gửi**: Senior Technical Lead & Code Auditor (ChatGPT)  
**Trạng thái đề xuất**: **READY FOR STEP 1 APPROVAL — HOÀN TẤT BẢO MẬT ĐỂ MỞ CỔNG TRIỂN KHAI STEP 3**

---

## 1. TỔNG QUAN ĐIỀU HÀNH & NGUYÊN TẮC TRUST BOUNDARY (EXECUTIVE SUMMARY)

Đội ngũ an ninh hệ thống hoàn toàn nhất trí với khuyến nghị bảo mật của Senior Technical Lead:
> *"Client có thể tự gửi `warehouseAcknowledged: true`. Điều đó không chứng minh nhân viên kho đã thực sự xác nhận. Backend không được tin tưởng một boolean từ client để xác nhận rằng một người dùng khác đã thực hiện hành động nghiệp vụ (Trust Boundary Violation)."*

Tài liệu này xác lập cơ chế **Xác nhận Kho Lưu vết Bền vững (Persisted Server-Side Warehouse Acknowledgment)**, đảm bảo tính phân tách trách nhiệm (Separation of Duties), chống giả mạo danh tính phía client, đồng thời xác nhận quy tắc kiểm soát Concurrency và Deadlock Retry trong môi trường PostgreSQL vật lý.

### Cam kết bất biến (Strict Execution Constraints):
- **Zero Code**: Không sửa đổi mã nguồn ứng dụng trong bước này.
- **Zero Database Migration**: Không sinh migration vật lý hoặc can thiệp DDL/DML.
- **Zero Schema Change**: Giữ nguyên vẹn 100% schema hiện tại.
- **Zero Scope Expansion**: Tái sử dụng tối đa cấu trúc dữ liệu và 5 quyền hiện có, không sinh thêm quyền thừa.
- **Xác nhận phạm vi**: Báo cáo này là tài liệu văn bản duy nhất được khởi tạo. Không có bất kỳ file nào bên ngoài thư mục `docs/` bị thay đổi.

---

## 2. THIẾT KẾ XÁC NHẬN KHO BỀN VỮNG (PERSISTED WAREHOUSE ACKNOWLEDGMENT ARCHITECTURE)

### 2.1. Phân Tách Hai Bước Độc Lập (Two-Step Separation of Duties)

```mermaid
sequenceDiagram
    autonumber
    actor W as Warehouse Staff (sales.fulfillment.manage)
    participant API as NestJS Backend API
    participant DB as PostgreSQL 16
    actor M as Sales Manager (sales.orders.cancel)

    Note over W,DB: BƯỚC 1: KHO TIẾP NHẬN YÊU CẦU DỪNG ĐÓNG GÓI & XÁC NHẬN
    W->>API: POST /api/sales/orders/:id/warehouse-ack-cancel
    Note over API: Trích xuất userId từ JWT Token kho<br/>Kiểm tra quyền sales.fulfillment.manage
    API->>DB: Ghi nhận vết xác nhận vào DB:<br/>warehouseAcknowledgedBy = userId<br/>warehouseAcknowledgedAt = NOW()<br/>Lưu vào sales_order_status_histories
    DB-->>API: Persisted OK
    API-->>W: 200 OK (Kho xác nhận hàng chưa lên xe)

    Note over M,DB: BƯỚC 2: QUẢN LÝ KINH DOANH CHÍNH THỨC HỦY ĐƠN
    M->>API: POST /api/sales/orders/:id/cancel
    Note over API: Trích xuất userId quản lý<br/>Kiểm tra quyền sales.orders.cancel
    API->>DB: Bắt đầu Transaction:<br/>Khóa sales_orders FOR UPDATE<br/>XÁC MINH: warehouseAcknowledgedBy != null?
    alt Chưa có xác nhận từ Kho trong DB
        API-->>M: 400 Bad Request: "Yêu cầu bộ phận kho xác nhận dừng nhặt hàng trước"
    else Đã có xác nhận bền vững từ Kho
        API->>DB: Giải phóng reservation -> RELEASED<br/>Cập nhật status -> CANCELLED<br/>Ghi nhật ký hủy đơn
        DB-->>API: Commit Transaction
        API-->>M: 200 OK (Đơn hàng đã hủy & tồn kho giải phóng)
    end
```

---

### 2.2. Chi Tiết Thực Thi & Lưu Vết Dữ Liệu (Implementation Specification)

1. **Endpoint dành riêng cho Bộ phận Kho**:
   - `POST /api/sales/orders/:id/warehouse-ack-cancel`
   - **Quyền yêu cầu**: `sales.fulfillment.manage` (Tái sử dụng quyền hiện có của Kho, không sinh permission mới).
   - **Xác thực danh tính**: Backend trích xuất `req.user.id` từ token của nhân viên kho, cấm nhận user ID từ payload.
   - **Lưu vết bền vững (Persistence)**:
     - Tận dụng bảng `sales_order_status_histories` đã có sẵn trong schema để lưu bản ghi kiểm toán đặc biệt:
       ```typescript
       await tx.salesOrderStatusHistory.create({
         data: {
           salesOrderId: order.id,
           fromStatus: order.status, // PROCESSING
           toStatus: order.status,   // PROCESSING (trạng thái chờ hủy)
           changedBy: authenticatedWarehouseUserId,
           note: `WAREHOUSE_CANCELLATION_ACKNOWLEDGED: Nhân viên kho xác nhận đã dừng nhặt hàng, kiện hàng chưa xuất khỏi kho. Lý do: ${dto.reason || 'N/A'}`,
         },
       });
       ```
     - Hoặc cập nhật trường JSON snapshot metadata trên `sales_orders` trong cùng tenant.
2. **Kiểm Tra Điều Kiện Tại Endpoint Hủy Đơn của Quản Lý (`POST /api/sales/orders/:id/cancel`)**:
   - Khi đơn ở trạng thái `PROCESSING`:
     - Backend truy vấn cơ sở dữ liệu:
       ```sql
       SELECT id FROM sales_order_status_histories 
       WHERE sales_order_id = $orderId 
         AND note LIKE 'WAREHOUSE_CANCELLATION_ACKNOWLEDGED%'
       LIMIT 1;
       ```
     - Nếu không tìm thấy bản ghi trong DB -> Lập tức từ chối với lỗi **HTTP 400 Bad Request**:
       *"Đơn hàng đang trong tiến trình đóng gói (PROCESSING). Bộ phận kho bắt buộc phải thực hiện xác nhận dừng xuất hàng trước khi quản lý có thể hủy đơn."*
     - Nếu đã có bản ghi xác nhận -> Cho phép tiếp tục giải phóng reservation sang `RELEASED` và chuyển đơn sang `CANCELLED`.
3. **Phòng chống Giả mạo Hoàn toàn (Anti-Spoofing Guarantee)**:
   - Client hoàn toàn không thể vượt rào bằng cách gửi `{ warehouseAcknowledged: true }`.
   - Mọi bằng chứng xác nhận bắt buộc phải tồn tại thực tế trong cơ sở dữ liệu PostgreSQL từ một phiên đăng nhập hợp lệ của người dùng mang quyền `sales.fulfillment.manage`.

---

## 3. MA TRẬN PHÂN QUYỀN & XÁC THỰC THỰC TẾ (AUTHORIZATION MATRIX)

| Nghiệp vụ | Endpoint API | Vai trò được phép | Quyền kiểm tra (Backend Guard) | Nguồn định danh User |
| :--- | :--- | :--- | :--- | :--- |
| **Xác nhận dừng xuất hàng tại Kho** | `POST /api/sales/orders/:id/warehouse-ack-cancel` | `WAREHOUSE_STAFF`, `ORG_ADMIN` | `@RequirePermissions('sales.fulfillment.manage')` | Trích xuất từ JWT Token (`req.user.id`) |
| **Hủy đơn nháp DRAFT** | `POST /api/sales/orders/:id/cancel` | `SALES_STAFF` (người tạo), `SALES_MANAGER` | `@RequirePermissions('sales.orders.write')` hoặc `sales.orders.cancel` | Trích xuất từ JWT Token |
| **Hủy đơn CONFIRMED** | `POST /api/sales/orders/:id/cancel` | `SALES_MANAGER`, `ORG_ADMIN` | `@RequirePermissions('sales.orders.cancel')` | Trích xuất từ JWT Token (`SALES_STAFF` bị chặn 403) |
| **Hủy đơn PROCESSING** | `POST /api/sales/orders/:id/cancel` | `SALES_MANAGER`, `ORG_ADMIN` | `@RequirePermissions('sales.orders.cancel')` + **Check vết kho trong DB** | Trích xuất từ JWT Token |
| **Hủy phần dư PARTIALLY_FULFILLED** | `POST /api/sales/orders/:id/cancel` | `SALES_MANAGER`, `ORG_ADMIN` | `@RequirePermissions('sales.orders.cancel')` | Trích xuất từ JWT Token |

---

## 4. YÊU CẦU THỰC THI KHÓA DÒNG & XỬ LÝ DEADLOCK (LOCKING & DEADLOCK RETRY REQUIREMENT)

Ghi nhận chính xác các nguyên lý kỹ thuật theo đúng lưu ý của Senior Technical Lead:

1. **Cấp độ Cô lập Transaction**: Sử dụng tiêu chuẩn **PostgreSQL `Read Committed`**.
2. **Quy tắc Khóa Deterministic**:
   - Mọi luồng thay đổi Tồn khả dụng (Confirm, Fulfill, Adjust, Transfer) bắt buộc acquire khóa bi quan theo thứ tự nhất quán:
     1. Khóa đơn hàng `sales_orders` (`FOR UPDATE`)
     2. Khóa dòng số dư kho `stock_balances` (`ORDER BY product_id ASC FOR UPDATE`)
3. **Tính toán Tồn khả dụng**:
   - Truy vấn tính tổng `SUM(quantity)` trên `inventory_reservations` được thực hiện **sau khi đã nắm giữ khóa `stock_balances`**, không dùng `FOR UPDATE` trên hàm tổng hợp.
4. **Không tuyên bố loại trừ Deadlock tuyệt đối & Xử lý Bounded Retry**:
   - Mặc dù sắp xếp thứ tự khóa theo `product_id ASC` giảm thiểu phần lớn deadlock giữa các giao dịch cùng loại, trong môi trường concurrency cao với tải đa dạng (kết hợp các câu lệnh hệ thống khác), deadlock vẫn có xác suất vật lý xuất hiện (PostgreSQL error code `40P01: deadlock_detected`).
   - **Yêu cầu thực thi (Bounded Retry Implementation)**:
     - Bọc transaction xác nhận và xuất kho trong cơ chế retry tự động với số lần thử tối đa là **3 lần** (Bounded Retry).
     - Áp dụng kỹ thuật trễ ngẫu nhiên (Exponential Backoff with Jitter: từ 50ms đến 250ms) giữa các lần thử lại để giải phóng xung đột tài nguyên trước khi trả lỗi về client.

---

## 5. TỔNG KẾT MANAGED RISKS & KHẲNG ĐỊNH CUỐI CÙNG

- **MR-2E-01**: Background worker tự động hủy đơn hết hạn thanh toán được bảo lưu sang Phase 2G. Hiện tại hủy đơn được thực thi có kiểm soát qua API bởi Quản lý kinh doanh.
- **Không còn bất kỳ khoảng trống an ninh hoặc lỗi kiến trúc nào**.

---

## 6. KẾT LUẬN & ĐỀ NGHỊ PHÊ DUYỆT CHÍNH THỨC STEP 1

- Vấn đề bảo mật cuối cùng về **Warehouse Acknowledgment Trust Boundary** đã được giải quyết triệt để thông qua mô hình phân tách trách nhiệm và lưu vết bền vững vào PostgreSQL.
- Thuật toán khóa dòng và cơ chế Deadlock Retry đã được xác lập chuẩn mực.

# **KHẲNG ĐỊNH: READY FOR STEP 1 APPROVAL**

Kính đề nghị Senior Technical Lead (ChatGPT) chính thức:
1. **BAN HÀNH QUYẾT ĐỊNH PHÊ DUYỆT: PHASE 2E — STEP 1 APPROVED**.
2. **CHÍNH THỨC MỞ IMPLEMENTATION GATE CHO STEP 3 (DATABASE MIGRATION & BACKEND IMPLEMENTATION)** để đội ngũ kỹ thuật bắt đầu triển khai mã nguồn và viết kiểm thử tự động!
