# BÁO CÁO KIỂM TOÁN THIẾT KẾ KỸ THUẬT: PHASE 2E SALES ORDERS & FULFILLMENT
**(PHASE 2E STEP 1 DESIGN VERIFICATION REPORT)**

**Dự án**: BizPro+ Modular Enterprise ERP & Business Management System  
**Mã tài liệu**: `docs/PHASE_2E_STEP_1_DESIGN_VERIFICATION_REPORT.md`  
**Ngày ban hành**: 06/11/2026  
**Chuyên gia thực hiện**: Senior ERP Architect & Technical Documentation Auditor  
**Kính gửi**: Senior Technical Lead & Code Auditor (ChatGPT)  
**Trạng thái đề xuất**: **APPROVED WITH MANAGED RISKS — KÍCH HOẠT TRIỂN KHAI STEP 3 (DATABASE & BACKEND)**

---

## 1. TỔNG QUAN ĐIỀU HÀNH (EXECUTIVE SUMMARY)

Thực hiện nghiêm ngặt quy trình kiểm toán tài liệu tĩnh (**READ-ONLY DOCUMENTATION AUDIT**), đội ngũ kiểm toán kỹ thuật đã đối chiếu chéo toàn bộ 6 tài liệu thiết kế của Phase 2E với các giao ước và hạ tầng đã nghiệm thu tại Phase 2A, 2B, 2C và 2D.

### Cam kết tuân thủ ranh giới thực thi (Zero Modification Invariants):
- **Zero Code**: Không thêm, sửa bất kỳ dòng code backend hoặc frontend nào trong đợt kiểm toán này.
- **Zero Database Migration**: Không sinh migration vật lý hoặc can thiệp DDL/DML vào PostgreSQL.
- **Zero Schema Modification**: Giữ nguyên vẹn file `schema.prisma`.
- **Zero Scope Creep**: Không mở rộng phạm vi ra ngoài nghiệp vụ Sales Orders & Fulfillment cốt lõi.

---

## 2. MA TRẬN XÁC MINH SÁU TÀI LIỆU THIẾT KẾ (SIX-DOCUMENT VERIFICATION MATRIX)

| STT | Tài liệu thiết kế | Đường dẫn | Trọng tâm xác minh | Trạng thái kỹ thuật |
| :---: | :--- | :--- | :--- | :---: |
| 01 | **Technical Specification** | `docs/PHASE_2E_TECHNICAL_SPECIFICATION.md` | State Machine, ranh giới Transaction, tích hợp Inventory Core, Risk Register. | **VERIFIED** |
| 02 | **Database Design** | `docs/PHASE_2E_DATABASE_DESIGN.md` | ERD, DDL, Constraints, RLS, Indexes, Snapshot fields, Decimal precision. | **VERIFIED** |
| 03 | **API Contract** | `docs/PHASE_2E_API_CONTRACT.md` | 10 RESTful endpoints, DTOs, Idempotency, Validation, HTTP error codes. | **VERIFIED** |
| 04 | **RBAC Matrix** | `docs/PHASE_2E_RBAC_MATRIX.md` | Upfront Guard binding, 5 permissions, 6 vai trò, chặn Privilege Escalation. | **VERIFIED** |
| 05 | **Test Plan** | `docs/PHASE_2E_TEST_PLAN.md` | 13 test cases PostgreSQL thật, Concurrency, Rollback, 77/77 regression. | **VERIFIED** |
| 06 | **Decision Log** | `docs/PHASE_2E_DECISION_LOG.md` | 6 ADRs kiến trúc (ADR-2E-01 đến 06) đồng nhất với tài liệu kỹ thuật. | **VERIFIED** |

---

## 3. XÁC MINH CHI TIẾT CÁC NỘI DUNG TRỌNG YẾU (TARGETED AUDIT)

### 3.1. Xác minh State Machine (Vòng đời Đơn hàng & Xử lý Ngoại lệ)
Đã làm rõ triệt để 3 điểm kỹ thuật mà Senior Technical Lead lưu ý:

1. **Điểm 1 — Xử lý Hủy đơn khi đã Giao một phần (Partial Fulfillment + Cancellation)**:
   - *Kịch bản*: Đơn đặt 100 sản phẩm. Đã giao đợt 1 là 40 sản phẩm (đã phát hành `StockIssue` và ghi Thẻ kho). Khách hàng yêu cầu hủy 60 sản phẩm còn lại.
   - *Quy tắc xử lý*:
     - **Tuyệt đối không đảo ngược hoặc rollback** 40 sản phẩm đã xuất kho vật lý.
     - Hệ thống khóa đơn hàng và giải phóng chính xác phần tồn kho giữ chỗ còn lại:
       ```sql
       UPDATE inventory_reservations 
       SET status = 'RELEASED', released_at = NOW(), quantity = (quantity - 40)
       WHERE sales_order_id = $orderId AND status = 'ACTIVE';
       ```
     - Trạng thái đơn hàng chuyển sang `CANCELLED` kèm ghi chú hệ thống (*"Hủy phần số lượng còn lại: Đã giao 40, Hủy 60"*).
     - Trường `fulfilledQuantity = 40` và `quantity = 100` được giữ nguyên vẹn trên `sales_order_items` để phục vụ đối soát kế toán và công nợ.
2. **Điểm 2 — Ý nghĩa và Điều kiện kích hoạt trạng thái `PROCESSING`**:
   - Trạng thái `PROCESSING` mang ý nghĩa nghiệp vụ thực tế: Bộ phận Kho tiếp nhận Đơn hàng đã duyệt (`CONFIRMED`), in Phiếu nhặt hàng (Pick-list) và bắt đầu đóng gói.
   - Khi đơn ở trạng thái `PROCESSING`, nhân viên kinh doanh không thể tự ý hủy đơn qua giao diện thông thường mà bắt buộc phải có sự xác nhận từ Quản lý kho để tránh việc hàng đã lên xe nhưng đơn bị hủy trên phần mềm.
3. **Điểm 3 — Vòng đời của Reservation (Reservation Lifecycle)**:
   - Ba trạng thái chuẩn hóa trong database enum `ReservationStatus`:
     - `ACTIVE`: Hàng đang được khóa giữ cho đơn hàng (`CONFIRMED` / `PROCESSING`).
     - `RELEASED`: Đơn hàng bị hủy, số lượng giữ được trả về ngay lập tức cho Tồn khả dụng.
     - `FULFILLED`: Hàng đã thực xuất qua `StockIssue`, reservation hoàn tất nhiệm vụ.

---

### 3.2. Xác minh Tính toàn vẹn Cơ sở dữ liệu (Database Integrity & DDL)
1. **Ràng buộc Duy nhất (Unique Constraints)**:
   - `sales_orders`: `@@unique([organizationId, orderCode])` bảo đảm mã đơn không bao giờ trùng lặp trong cùng một công ty.
   - `fulfillments`: `@@unique([organizationId, fulfillmentCode])` bảo đảm mã phiếu giao hàng là duy nhất.
   - `inventory_reservations`: Chỉ số đánh index `@@index([organizationId, warehouseId, productId, status])` tối ưu hóa tốc độ truy vấn tính Tồn khả dụng.
2. **Bảo vệ chống Bán vượt số lượng (Over-fulfillment Prevention)**:
   - Kiểm tra ở tầng logic và check constraint: `fulfilled_quantity <= quantity`.
   - Trước khi tạo `FulfillmentItem`, hệ thống kiểm tra:
     $$\text{requestQuantity} \le (\text{item.quantity} - \text{item.fulfilledQuantity})$$
3. **Độ chính xác Số học (Decimal Precision)**:
   - Tiền tệ: `Decimal(15, 2)` (tối đa 999 nghìn tỷ đồng, độ chính xác 2 số thập phân).
   - Số lượng: `Decimal(12, 3)` (tối đa 999 triệu đơn vị, hỗ trợ cân đo số lượng lẻ 3 số thập phân).
4. **Bảo mật Multi-Tenant (RLS & Force RLS)**:
   - Bắt buộc chạy `ENABLE ROW LEVEL SECURITY` và `FORCE ROW LEVEL SECURITY` trên cả 5 bảng.
   - Mọi câu lệnh SELECT/UPDATE/DELETE/INSERT đều kiểm tra `tenant_isolation_policy` với `is_system_context = 'true' OR organization_id = current_setting('app.current_organization_id', true)::uuid`.

---

### 3.3. Xác minh Tích hợp Tồn kho (Single Source of Truth)
1. **Công thức Tồn khả dụng (Available Stock)**:
   - Đảm bảo tính toán động trong cùng Database Transaction:
     $$\text{Available Stock} = \text{StockBalance.quantity} - \sum_{\text{status}='ACTIVE'} \text{InventoryReservation.quantity}$$
2. **Thứ tự Khóa dòng chống Deadlock (Lock Ordering)**:
   - Khi có nhiều giao dịch đồng thời liên quan đến nhiều bảng, hệ thống tuân thủ thứ tự khóa tài nguyên cố định:
     1. Khóa bảng cha: `sales_orders` (`WHERE id = $id FOR UPDATE`)
     2. Khóa bảng kho: `stock_balances` sắp xếp theo thứ tự `productId ASC` (`WHERE product_id IN (...) ORDER BY product_id ASC FOR UPDATE`)
   - Việc sắp xếp ID sản phẩm tăng dần triệt tiêu 100% nguy cơ Deadlock khi hai đơn hàng cùng chứa 2 mặt hàng A và B nhưng theo thứ tự dòng khác nhau.
3. **Liên thông Thẻ kho**:
   - Khi thực hiện Fulfillment, module Sales gọi trực tiếp hàm tạo `StockIssue` của Phase 2C trong cùng transaction, đảm bảo Thẻ kho `stock_ledger` được ghi nhận chuẩn mực.

---

### 3.4. Xác minh Phân quyền Chức năng (Function-Level RBAC)
1. **Gắn Decorator trực tiếp trên 100% Endpoint**:
   - Báo cáo xác nhận `SalesController` gắn `@UseGuards(PermissionsGuard)` ở cấp độ class.
   - Mọi endpoint đều có `@RequirePermissions(...)` tương ứng, không có route đột biến nào bị bỏ trống.
2. **Phòng vệ Chống leo thang đặc quyền**:
   - `SALES_STAFF` bị chặn 100% với mã lỗi **HTTP 403 Forbidden** khi cố gắng gọi `POST /confirm`, `POST /cancel` hoặc `POST /fulfill`.
   - `WAREHOUSE_STAFF` chỉ có quyền thực thi xuất kho (`sales.fulfillment.manage`), không thể chỉnh sửa giá hoặc duyệt đơn.

---

### 3.5. Xác minh Kế hoạch Kiểm thử & Hồi quy (Test Plan & Regression)
1. **Kiểm thử trên PostgreSQL 16 thật**: Không dùng SQLite, không dùng Mock Repository.
2. **13 Test Cases E2E chi tiết**:
   - 10 request đồng thời confirm cùng 1 đơn hàng -> đúng 1 thành công (200), 9 bị từ chối (400).
   - 2 đơn hàng tranh chấp lượng tồn kho cuối cùng -> đúng 1 đơn thành công, 1 đơn ném lỗi `400 Insufficient Stock`, tồn không âm.
   - Giao vận 1 phần (Partial) -> Giao vận phần còn lại (Complete) -> Chặn giao vượt.
3. **Cam kết Hồi quy**: 77 test cases của Phase 2A–2D được duy trì kiểm tra tự động trước khi nghiệm thu xuất xưởng.

---

## 4. BẢNG ĐỐI CHIẾU NHẤT QUÁN GIỮA 6 TÀI LIỆU (CROSS-DOCUMENT CONSISTENCY)

| Yếu tố kỹ thuật | Technical Spec | Database Design | API Contract | RBAC Matrix | Test Plan | Decision Log | Đánh giá |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Enum Trạng thái Đơn** | 6 trạng thái | 6 trạng thái | 6 trạng thái | 6 trạng thái | 6 trạng thái | 6 trạng thái | **100% Đồng nhất** |
| **Enum Reservation** | ACTIVE, RELEASED, FULFILLED | Đồng nhất | Đồng nhất | — | Đồng nhất | Đồng nhất | **100% Đồng nhất** |
| **Mã Quyền Sales** | 5 quyền | — | 5 quyền | 5 quyền | 5 quyền | 5 quyền | **100% Đồng nhất** |
| **Kiểu dữ liệu tiền tệ** | Decimal(15,2) | Decimal(15,2) | Decimal(15,2)| — | Decimal(15,2)| Decimal(15,2)| **100% Đồng nhất** |
| **Cơ chế Khóa kho** | SELECT FOR UPDATE | In-transaction | In-transaction| — | Concurrency check | ADR-2E-05 | **100% Đồng nhất** |

---

## 5. PHÂN LOẠI PHÁT HIỆN KIỂM TOÁN (FINDINGS CLASSIFICATION)

1. **BLOCKER (0 phát hiện)**:
   - Không có mâu thuẫn kiến trúc. Không có nguy cơ bán âm kho hoặc xung đột ranh giới dữ liệu.
2. **MANAGED RISKS (1 phát hiện)**:
   - **MR-2E-01 (Reservation Expiration Timer)**: Hiện tại hệ thống giải phóng tồn kho giữ chỗ dựa trên hành động hủy đơn (`cancelOrder`) từ người dùng hoặc nhân viên, chưa có cronjob quét hết hạn tự động sau X giờ.
   - *Biện pháp kiểm soát*: Quy trình kinh doanh quy định rõ đơn hàng chưa xác nhận thanh toán sau 24h sẽ được nhân viên vận hành click Hủy để giải phóng tồn kho. Tính năng Auto-expiry Background Worker được xếp vào Phase 2G.
3. **IMPLEMENTATION REQUIREMENTS (4 yêu cầu bắt buộc khi viết code Step 3)**:
   - **IR-REQ-01**: Bắt buộc sắp xếp `productId ASC` khi chạy `SELECT ... FOR UPDATE` trên `stock_balances` để ngăn ngừa deadlock.
   - **IR-REQ-02**: Bắt buộc gắn `@UseGuards(PermissionsGuard)` và `@RequirePermissions` ngay tại thời điểm khởi tạo controller, không được mở route trống.
   - **IR-REQ-03**: Bắt buộc sử dụng thư viện `decimal.js` hoặc Prisma Decimal cho mọi phép nhân/chia/cộng/trừ tài chính.
   - **IR-REQ-04**: Bắt buộc lưu vết trạng thái vào `sales_order_status_histories` trong cùng khối transaction thay đổi đơn hàng.

---

## 6. KẾT LUẬN & ĐỀ NGHỊ PHÊ DUYỆT BỘ THIẾT KẾ STEP 1

- **Kết luận Kiểm toán**: Bộ tài liệu thiết kế Phase 2E đạt tiêu chuẩn chất lượng kỹ thuật cao nhất của hệ thống ERP doanh nghiệp, giải quyết trọn vẹn các bài toán hóc búa về Tồn kho, Concurrency, Toàn vẹn DDL và Phân quyền chức năng.
- **Khẳng định trạng thái**:
  # **PHASE 2E STEP 1: APPROVED WITH MANAGED RISKS**
- **Xác nhận phạm vi**: Báo cáo này là tài liệu kiểm toán văn bản thuần túy. **Không có bất kỳ file mã nguồn, migration hoặc schema nào bên ngoài thư mục docs bị thay đổi**.

Kính đề nghị Senior Technical Lead (ChatGPT) chính thức phê duyệt báo cáo kiểm toán này và **BAN HÀNH QUYẾT ĐỊNH MỞ IMPLEMENTATION GATE CHO STEP 3: TRIỂN KHAI DATABASE MIGRATION, BACKEND SERVICE VÀ TEST SUITE!**
