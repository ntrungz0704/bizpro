# KẾ HOẠCH KIỂM THỬ: PHASE 2E SALES ORDERS & FULFILLMENT
**(PHASE 2E TEST PLAN)**

**Dự án**: BizPro+ Modular Enterprise ERP & Business Management System  
**Mã tài liệu**: `docs/PHASE_2E_TEST_PLAN.md`  
**Ngày ban hành**: 06/11/2026  
**Chuyên gia thực hiện**: QA Engineer & Senior Technical Lead  
**Kính gửi**: Senior Technical Lead & Code Auditor (ChatGPT)  
**Trạng thái**: **DESIGN SPECIFICATION — SẴN SÀNG CHỜ PHÊ DUYỆT (STEP 1)**

---

## 1. NGUYÊN TẮC KIỂM THỬ THỰC NGHIỆM (TESTING PRINCIPLES)

1. **Zero-Mock Policy**: Toàn bộ kiểm thử được thực thi trên môi trường cơ sở dữ liệu vật lý thật (PostgreSQL 16) thông qua Jest và Supertest. Không sử dụng in-memory mock hoặc stub cho các dịch vụ cốt lõi.
2. **Stress & Concurrency Focus**: Đặc biệt tập trung vào các kịch bản cạnh tranh tài nguyên (Race Condition), khóa hàng đồng thời (Concurrent Reservation) và xuất kho đồng thời (Concurrent Fulfillment).
3. **Zero Regression Target**: Toàn bộ 77 test cases của các Phase 2A, 2B, 2C, 2D phải tiếp tục vượt qua (PASS 100%) sau khi tích hợp Phase 2E.

---

## 2. MA TRẬN KỊCH BẢN KIỂM THỬ (TEST CASE MATRIX)

File kiểm thử chính: `backend/test/phase2e.e2e-spec.ts`

| Nhóm Kiểm thử | Mã Test Case | Tên Kịch bản & Thao tác | Đầu vào & Điều kiện | Kết quả Mong đợi (Assertion) |
| :--- | :--- | :--- | :--- | :--- |
| **1. CRUD & Decimal** | `TC-SO-01` | Tạo đơn hàng nháp DRAFT hợp lệ | Khách hàng hợp lệ, 2 sản phẩm, chiết khấu và VAT | HTTP 201 Created. Tính đúng Subtotal, Tax, Total bằng Decimal. Dòng hàng lưu đúng Snapshots. |
| **1. CRUD & Decimal** | `TC-SO-02` | Chặn tạo đơn hàng thiếu thông tin hoặc sai số học | `quantity = 0` hoặc âm, chiết khấu > tổng tiền | HTTP 400 Bad Request. Không lưu bản ghi rác vào DB. |
| **2. RBAC Enforcement**| `TC-RBAC-01`| `SALES_STAFF` cố tình xác nhận đơn hàng | Token của User mang role `SALES_STAFF`, gọi `/confirm` | **HTTP 403 Forbidden**. Lỗi: Thiếu quyền `sales.orders.confirm`. |
| **2. RBAC Enforcement**| `TC-RBAC-02`| `SALES_MANAGER` xác nhận đơn hàng | Token của User mang role `SALES_MANAGER` | **HTTP 200 OK**. Đơn chuyển sang `CONFIRMED`. |
| **3. Tenant Isolation**| `TC-ISO-01` | Người dùng Org A truy cập đơn hàng Org B | Gửi `GET /api/sales/orders/:id` của Org B từ token Org A | **HTTP 404 Not Found**. RLS và Tenant Context chặn hoàn toàn. |
| **4. Concurrency** | `TC-CONC-01`| **10 request đồng thời xác nhận cùng 1 đơn hàng** | Dùng `Promise.allSettled` bắn 10 request `POST /confirm` | **Đúng 1 request thành công (200)**, 9 request bị từ chối (400 Conflict/Invalid State). Đúng 1 bộ reservation được tạo trong DB. |
| **4. Concurrency** | `TC-CONC-02`| **Chống bán âm kho (Overselling Prevention)** | Kho có tồn khả dụng = 10. Hai đơn hàng đồng thời đặt mỗi đơn 8 chiếc | **Đúng 1 đơn được xác nhận**, đơn còn lại bị từ chối với lỗi **400 Insufficient Stock**. Tồn kho không bao giờ bị âm. |
| **5. Reservation** | `TC-RES-01` | Giải phóng hàng khi hủy đơn hàng | Hủy đơn hàng đang `CONFIRMED` | **HTTP 200 OK**. Bản ghi `inventory_reservations` chuyển sang `RELEASED`. Tồn khả dụng của kho phục hồi ngay lập tức. |
| **6. Fulfillment** | `TC-FUL-01` | Xuất kho giao hàng một phần (Partial Delivery) | Đơn đặt 10 sản phẩm, xuất giao đợt 1 là 4 sản phẩm | HTTP 200 OK. Đơn chuyển trạng thái `PARTIALLY_FULFILLED`. `StockIssue` được tạo thành công, thẻ kho trừ 4. |
| **6. Fulfillment** | `TC-FUL-02` | Chặn xuất kho vượt số lượng đặt còn lại | Sau khi đã giao 4 sản phẩm, yêu cầu xuất thêm 8 sản phẩm (4 + 8 = 12 > 10) | **HTTP 400 Bad Request**. Báo lỗi vượt quá số lượng còn lại. |
| **6. Fulfillment** | `TC-FUL-03` | Xuất kho giao hàng phần còn lại (Complete Delivery) | Xuất nốt 6 sản phẩm còn lại | HTTP 200 OK. Đơn tự động chuyển sang `FULFILLED`. Reservation chuyển sang `FULFILLED`. |
| **7. Audit Trail** | `TC-AUD-01` | Kiểm tra tính bất biến của lịch sử trạng thái | Truy vấn bảng `sales_order_status_histories` | Đầy đủ các bước chuyển: `DRAFT -> CONFIRMED -> PROCESSING -> PARTIALLY_FULFILLED -> FULFILLED`. Lưu đúng `changedBy`. |
| **8. Dashboard** | `TC-DASH-01`| Kiểm chứng số liệu thống kê doanh thu và tỷ lệ giao | Gọi `GET /api/sales/dashboard` | HTTP 200 OK. Khớp 100% với các phép tính tổng hợp trên cơ sở dữ liệu PostgreSQL thực tế. |

---

## 3. QUY TRÌNH CHẠY HỒI QUY TOÀN HỆ THỐNG (FULL REGRESSION PROTOCOL)

Trước khi gửi báo cáo hoàn thành Phase 2E, nhóm QA bắt buộc thực hiện kiểm tra 100% các suite kiểm thử:

1. `test/database-invariants.e2e-spec.ts` (Phase 1D / 2A Foundation)
2. `test/auth.e2e-spec.ts` (Phase 2A Auth & Dual-Token)
3. `test/rls.e2e-spec.ts` (Phase 2A RLS Multi-Tenant)
4. `test/phase2b.e2e-spec.ts` (Phase 2B RBAC & Org)
5. `test/department.e2e-spec.ts` (Phase 2B Department Tree)
6. `test/audit-log.e2e-spec.ts` (Phase 2B Audit Trail)
7. `test/phase2c.e2e-spec.ts` (Phase 2C Inventory Core)
8. `test/phase2d.e2e-spec.ts` (Phase 2D CRM Intelligence)
9. `test/phase2e.e2e-spec.ts` (Phase 2E Sales Orders & Fulfillment — Suite mới)

**Tiêu chuẩn nghiệm thu QA**: Tối thiểu 90/90 Tests PASS 100%, 0 Failures, 0 Skips.
