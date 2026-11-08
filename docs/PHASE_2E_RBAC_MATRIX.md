# MA TRẬN PHÂN QUYỀN CHỨC NĂNG: PHASE 2E SALES ORDERS & FULFILLMENT
**(PHASE 2E RBAC MATRIX)**

**Dự án**: BizPro+ Modular Enterprise ERP & Business Management System  
**Mã tài liệu**: `docs/PHASE_2E_RBAC_MATRIX.md`  
**Ngày ban hành**: 06/11/2026  
**Chuyên gia thực hiện**: Security Reviewer & Principal Architect  
**Kính gửi**: Senior Technical Lead & Code Auditor (ChatGPT)  
**Trạng thái**: **DESIGN SPECIFICATION — SẴN SÀNG CHỜ PHÊ DUYỆT (STEP 1)**

---

## 1. NGUYÊN TẮC BẢO MẬT & CHỈ THỊ BẮT BUỘC (SECURITY DIRECTIVE)

Tuân thủ nghiêm ngặt chỉ thị kiến trúc của Senior Technical Lead:
> *"Không được lặp lại khoảng trống Function-Level RBAC của Phase 2D trong module Sales mới. Sales Orders là nghiệp vụ có tác động trực tiếp đến tồn kho, cam kết giao hàng và dữ liệu kinh doanh. Các endpoint mới phải có permission guard ngay từ đầu, không chờ đến Phase 2G mới bổ sung."*

### Cơ chế áp dụng:
1. **100% Endpoints được bảo vệ**: Mọi route trong `SalesController` đều gắn `@UseGuards(PermissionsGuard)` và decorator `@RequirePermissions(...)`.
2. **Ngăn chặn triệt để Privilege Escalation**:
   - Nhân viên kinh doanh thông thường (`SALES_STAFF`) chỉ có quyền tạo và xem đơn, không thể tự ý bấm Xác nhận đơn (`confirm`) hoặc Hủy đơn (`cancel`).
   - Nhân viên kho (`WAREHOUSE_STAFF`) chỉ có quyền thực thi xuất kho (`fulfill`), không có quyền chỉnh sửa giá bán hoặc xóa đơn hàng.
   - Trưởng phòng kinh doanh (`SALES_MANAGER`) có quyền duyệt và hủy đơn.

---

## 2. DANH MỤC QUYỀN CHUẨN PHÂN HỆ SALES (PERMISSIONS CATALOG)

Các mã quyền mới được khai báo trong hệ thống RBAC của BizPro+:

| Mã quyền (Permission Code) | Phân hệ (Module) | Thao tác (Action) | Mô tả nghiệp vụ |
| :--- | :---: | :---: | :--- |
| `sales.orders.read` | `SALES` | `READ` | Xem danh sách, chi tiết và lịch sử đơn bán hàng. |
| `sales.orders.write` | `SALES` | `WRITE` | Tạo mới đơn hàng nháp (Draft) và chỉnh sửa thông tin. |
| `sales.orders.confirm` | `SALES` | `MANAGE` | Xác nhận đơn hàng và kích hoạt khóa giữ tồn kho (Reservation). |
| `sales.orders.cancel` | `SALES` | `MANAGE` | Hủy đơn hàng và giải phóng tồn kho đã khóa. |
| `sales.fulfillment.manage`| `SALES` | `MANAGE` | Xuất kho giao hàng (Fulfillment) và phát hành phiếu xuất kho. |

---

## 3. BẢNG PHÂN BỔ QUYỀN THEO VAI TRÒ (ROLE-PERMISSION MAPPING)

| Quyền hạn | SUPER_ADMIN | ORG_ADMIN | SALES_MANAGER | SALES_STAFF | WAREHOUSE_STAFF | ACCOUNTANT |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `sales.orders.read` | **Bypass** | **Có** | **Có** | **Có** | **Có** | **Có** |
| `sales.orders.write` | **Bypass** | **Có** | **Có** | **Có** | Không | Không |
| `sales.orders.confirm` | **Bypass** | **Có** | **Có** | Không (403) | Không (403) | Không (403) |
| `sales.orders.cancel` | **Bypass** | **Có** | **Có** | Không (403) | Không (403) | Không (403) |
| `sales.fulfillment.manage` | **Bypass** | **Có** | **Có** | Không (403) | **Có** | Không (403) |

*Ghi chú*:
- `SUPER_ADMIN`: Hệ thống tự động Bypass qua logic dòng 31 của `PermissionsGuard`.
- `ORG_ADMIN`: Quản trị viên tổ chức có toàn quyền với mọi hành động trong phạm vi tenant.
- `SALES_STAFF`: Khi cố tình gọi API `/confirm`, `/cancel` hoặc `/fulfill` sẽ lập tức nhận mã lỗi **HTTP 403 Forbidden**.

---

## 4. MA TRẬN ÁP DỤNG TRÊN TỪNG ENDPOINT (CONTROLLER BINDING MATRIX)

```typescript
@Controller('sales')
@UseGuards(PermissionsGuard)
export class SalesController {
  // 1. Tạo đơn hàng
  @Post('orders')
  @RequirePermissions('sales.orders.write')
  async createOrder(...) { ... }

  // 2. Xem danh sách đơn hàng
  @Get('orders')
  @RequirePermissions('sales.orders.read')
  async getOrders(...) { ... }

  // 3. Xem chi tiết đơn hàng
  @Get('orders/:id')
  @RequirePermissions('sales.orders.read')
  async getOrderById(...) { ... }

  // 4. Cập nhật đơn hàng nháp
  @Patch('orders/:id')
  @RequirePermissions('sales.orders.write')
  async updateOrder(...) { ... }

  // 5. Xác nhận đơn hàng (Duyệt & Khóa tồn kho)
  @Post('orders/:id/confirm')
  @RequirePermissions('sales.orders.confirm')
  async confirmOrder(...) { ... }

  // 6. Hủy đơn hàng (Giải phóng tồn kho)
  @Post('orders/:id/cancel')
  @RequirePermissions('sales.orders.cancel')
  async cancelOrder(...) { ... }

  // 7. Lịch sử đơn hàng
  @Get('orders/:id/history')
  @RequirePermissions('sales.orders.read')
  async getOrderHistory(...) { ... }

  // 8. Thực hiện xuất kho giao hàng
  @Post('orders/:id/fulfill')
  @RequirePermissions('sales.fulfillment.manage')
  async fulfillOrder(...) { ... }

  // 9. Danh sách phiếu giao hàng
  @Get('fulfillments')
  @RequirePermissions('sales.orders.read')
  async getFulfillments(...) { ... }

  // 10. Dashboard phân hệ Sales
  @Get('dashboard')
  @RequirePermissions('sales.orders.read')
  async getDashboard(...) { ... }
}
```

---

## 5. KẾ HOẠCH KIỂM THỬ XÁC NHẬN PHÂN QUYỀN (RBAC TEST EVIDENCE PLAN)

Trong file kiểm thử E2E `backend/test/phase2e.e2e-spec.ts`, nhóm kiểm thử bắt buộc bổ sung các test case xác thực quyền:

1. **Test Case RBAC-01 (Negative)**: Tạo người dùng mang vai trò `SALES_STAFF` (chỉ có quyền `sales.orders.read` và `sales.orders.write`). Gửi request `POST /api/sales/orders/:id/confirm`. Kết quả bắt buộc: **HTTP 403 Forbidden** (`Truy cập bị từ chối: Thiếu quyền bắt buộc [sales.orders.confirm]`).
2. **Test Case RBAC-02 (Negative)**: Người dùng `SALES_STAFF` gửi request `POST /api/sales/orders/:id/fulfill`. Kết quả bắt buộc: **HTTP 403 Forbidden**.
3. **Test Case RBAC-03 (Positive)**: Người dùng mang vai trò `SALES_MANAGER` (có quyền `sales.orders.confirm`) gửi request xác nhận đơn. Kết quả: **HTTP 200 OK**.
4. **Test Case RBAC-04 (Cross-Tenant Positive Isolation)**: Gửi request từ Organization B tới đơn hàng của Organization A. Kết quả bắt buộc: **HTTP 404 Not Found** (chặn IDOR tuyệt đối).
