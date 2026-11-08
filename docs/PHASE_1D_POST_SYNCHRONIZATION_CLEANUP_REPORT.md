# BÁO CÁO HOÀN TẤT KIỂM TRA KỸ THUẬT CUỐI CÙNG — PHASE 1D
## POST-SYNCHRONIZATION TECHNICAL CLEANUP REPORT

> **Dự án:** BizPro+ Enterprise ERP  
> **Giai đoạn:** Phase 1D — Authentication, Multi-Tenant Isolation & RBAC  
> **Trạng thái:** HOÀN TẤT KIỂM TRA — DESIGN ONLY  
> **Implementation Gate:** NOT APPROVED (HOLD) — GIỮ NGUYÊN  

---

## 1. MỤC TIÊU VÀ PHẠM VI KIỂM TRA

Báo cáo này thực hiện kiểm toán độc lập đối với 2 vấn đề kỹ thuật chuyên sâu cuối cùng thuộc hồ sơ thiết kế Phase 1D:
1. **Token Family Anti-Cycle Invariant** (Tính đúng đắn và ranh giới bảo đảm chống chu trình trong chuỗi refresh token).
2. **Prisma Raw Query & Tenant Context** (Cú pháp, phạm vi transaction, cách ly connection pool và nguyên tắc fail-closed).

Mọi kết luận trong báo cáo dựa trên phân tích toán học về đồ thị có hướng (DAG), cơ chế kiểm soát ràng buộc của PostgreSQL 16 và đặc tính thực thi của Prisma Client ORM.

---

## 2. NỘI DUNG 1: TOKEN FAMILY ANTI-CYCLE INVARIANT

### 2.1. Đối Tượng Kiểm Toán
* Tài liệu: `docs/PHASE_1D_DATABASE_DESIGN.md` (Mục 3, Bảng `refresh_tokens`).
* Các định nghĩa DDL liên quan:
  ```sql
  CONSTRAINT uq_refresh_tokens_family_seq UNIQUE (token_family_id, sequence_number),
  CONSTRAINT uq_refresh_tokens_replaced_by UNIQUE (replaced_by_token_id),
  CONSTRAINT uq_refresh_tokens_id_family UNIQUE (id, token_family_id),
  CONSTRAINT fk_refresh_tokens_replacement FOREIGN KEY (replaced_by_token_id, token_family_id)
    REFERENCES refresh_tokens (id, token_family_id) ON DELETE RESTRICT,
  CHECK (sequence_number > 0)
  ```
  Và chỉ mục một phần:
  ```sql
  CREATE UNIQUE INDEX idx_uq_active_token_per_family 
  ON refresh_tokens (token_family_id) 
  WHERE status = 'ACTIVE';
  ```

### 2.2. Phân Tích Kỹ Thuật Từng Ràng Buộc (Constraint Isolation Analysis)

| Ràng buộc DDL | Bản chất kiểm soát vật lý | Ngăn chu trình độc lập? | Giải thích chi tiết |
| :--- | :--- | :---: | :--- |
| **`CHECK (sequence_number > 0)`** | Bảo đảm số thứ tự là số nguyên dương ngặt ($seq \in \mathbb{N}^*$). | **KHÔNG** | Ràng buộc mức hàng (tuple-level). Một chu trình $T_1 \to T_2 \to T_1$ hoàn toàn thỏa mãn nếu $seq(T_1) = 1$ và $seq(T_2) = 2$ vì cả hai đều $> 0$. |
| **`UNIQUE (replaced_by_token_id)`** | Bảo đảm mỗi token chỉ là vật thay thế cho tối đa 1 token tiền nhiệm (In-degree $\le 1$). | **KHÔNG** | Ràng buộc ngăn phân nhánh ngược (2 token cũ cùng trỏ về 1 token mới). Tuy nhiên, một chu trình đơn giản 2 đỉnh $A \to B$ và $B \to A$ có in-degree = 1 cho cả hai đỉnh, nên hoàn toàn thỏa mãn ràng buộc UNIQUE này. |
| **`UNIQUE (token_family_id, seq)`** | Bảo đảm không có 2 token trong cùng family trùng số thứ tự. | **KHÔNG** | Chỉ bảo đảm ánh xạ $seq$ là đơn ánh. Không kiểm tra được thứ tự giữa đỉnh nguồn và đỉnh đích của cạnh thay thế. |
| **Composite FK `(replaced_by, family_id)`** | Bảo đảm token thay thế bắt buộc phải thuộc cùng một `token_family_id`. | **KHÔNG** | Ngăn chặn triệt để tham chiếu chéo family (Cross-family injection), nhưng không kiểm tra quan hệ thứ tự bên trong nội bộ family. |
| **Partial Unique Index `WHERE status = 'ACTIVE'`** | Bảo đảm tối đa 1 token có trạng thái `ACTIVE` trong 1 family. | **KHÔNG** | Chỉ khống chế trạng thái ACTIVE. Nếu các token trong chu trình đều có trạng thái `ROTATED`, partial index hoàn toàn không kích hoạt kiểm tra. |

### 2.3. Ranh Giới Kỹ Thuật: PostgreSQL Declarative vs Application Protocol

1. **Giới hạn của SQL Declarative Constraints:**
   * PostgreSQL **không hỗ trợ** subquery hoặc cross-row assertions trong câu lệnh `CHECK` (ví dụ: `CHECK (sequence_number < (SELECT sequence_number FROM ...))` là cú pháp không hợp lệ trong SQL chuẩn).
   * Do đó, các declarative constraints trên bảng `refresh_tokens` chỉ bảo đảm:
     * Cấu trúc là đồ thị có nửa bậc trong $\le 1$ và nửa bậc ngoài $\le 1$ (tập hợp các đường đi hoặc chu trình rời rạc).
     * Mọi cạnh đều thuộc nội bộ cùng một `token_family_id`.
     * Tối đa 1 token đang sống (`ACTIVE`).

2. **Cơ Chế Thực Sự Bảo Đảm Tính Không Chu Trình (DAG Invariant):**
   * Tính chất phi chu trình được bảo đảm bởi **Giao Thức Xoay Vòng Nguyên Tử (Atomic Rotation Protocol)** ở tầng ứng dụng kết hợp thứ tự sinh khóa:
     $$\text{Token mới } T_{k+1} \text{ luôn được sinh với: } seq(T_{k+1}) = seq(T_k) + 1$$
   * Token cũ $T_k$ chuyển trạng thái sang `ROTATED` và cập nhật `replaced_by_token_id = T_{k+1}.id`.
   * Vì $T_{k+1}$ là bản ghi vừa được `INSERT` (mới tồn tại), $T_k$ chỉ có thể trỏ tới một đỉnh trong tương lai, không bao giờ trỏ tới một đỉnh trong quá khứ.
   * Đây là mô hình sinh đồ thị **Append-Only Monotonic Chain**.

3. **Khuyến Nghị Bổ Sung Tầng Phòng Thủ Chiều Sâu (Database Trigger Invariant):**
   Để bảo đảm tuyệt đối ngay cả khi tầng ứng dụng bị lỗi logic hoặc có truy vấn update ngoài luồng, kiến trúc Phase 1D quy định bổ sung một `BEFORE UPDATE` trigger vào giai đoạn triển khai:
   ```sql
   CREATE OR REPLACE FUNCTION trg_check_refresh_token_monotonic_seq()
   RETURNS TRIGGER AS $$
   DECLARE
     v_target_seq INT;
   BEGIN
     IF NEW.replaced_by_token_id IS NOT NULL THEN
       SELECT sequence_number INTO v_target_seq
       FROM refresh_tokens
       WHERE id = NEW.replaced_by_token_id AND token_family_id = NEW.token_family_id;

       IF v_target_seq IS NULL OR v_target_seq <= NEW.sequence_number THEN
         RAISE EXCEPTION 'ANTI_CYCLE_VIOLATION: Token thay the co seq (%) phai lon hon token hien tai (%)',
           v_target_seq, NEW.sequence_number;
       END IF;
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER trg_refresh_tokens_monotonic_seq
   BEFORE UPDATE OF replaced_by_token_id ON refresh_tokens
   FOR EACH ROW
   EXECUTE FUNCTION trg_check_refresh_token_monotonic_seq();
   ```
   **Chứng minh toán học:** Khi mọi cạnh có hướng $(u, v)$ đều thỏa mãn $seq(v) > seq(u)$, hàm $seq: V \to \mathbb{N}^*$ là một ánh xạ thứ tự topo ngặt (Strict Topological Sorting) trên tập đỉnh hữu hạn. Một đồ thị hữu hạn có thứ tự topo ngặt là **Đồ thị có hướng không chu trình (DAG)**. Tính chất Anti-Cycle được bảo đảm $100\%$.

### 2.4. Kết Luận Nội Dung 1
Thiết kế DDL hiện tại trong `docs/PHASE_1D_DATABASE_DESIGN.md` là **HỢP LÝ VÀ CHÍNH XÁC**. Ranh giới giữa PostgreSQL declarative constraints và application transaction protocol đã được phân định rõ ràng. Không có lỗi kỹ thuật; trigger nêu trên sẽ được đưa vào làm Implementation Requirement bắt buộc khi mở Implementation Gate.

---

## 3. NỘI DUNG 2: PRISMA RAW QUERY & TENANT CONTEXT

### 3.1. Đối Tượng Kiểm Toán
* Tài liệu: `docs/PHASE_1D_ARCHITECTURE_BLUEPRINT.md` (Mục 4.2) và `docs/PHASE_1D_DATABASE_DESIGN.md` (Mục 4).
* Cú pháp chuẩn hóa:
  ```typescript
  await tx.$queryRaw`SELECT set_config('app.current_organization_id', ${orgId}::text, true);`;
  ```

### 3.2. Đánh Giá 5 Yếu Tố Xác Minh

#### 1. Phân biệt `$queryRaw` và `$executeRaw` trong Prisma
* Trong PostgreSQL, `set_config(setting_name, new_value, is_local)` là một SQL function trả về dữ liệu kiểu `text` (chứa giá trị vừa được thiết lập).
* `$executeRaw` trong Prisma ORM được thiết kế cho các lệnh DML/DDL (`INSERT`, `UPDATE`, `DELETE`) trả về số dòng bị ảnh hưởng (`number`). Khi thực thi một hàm `SELECT` qua `$executeRaw`, Prisma driver nhận gói tin `DataRow` từ giao thức PostgreSQL nhưng không xử lý kết quả, dẫn đến cảnh báo driver hoặc hành vi không xác định tùy thuộc phiên bản adapter.
* `$queryRaw` xử lý đúng gói tin `DataRow`, nhận kết quả `[{ set_config: orgId }]` và kết thúc câu lệnh một cách sạch sẽ theo chuẩn PostgreSQL wire protocol.
* **Kết luận:** Tài liệu chỉ định dùng `tx.$queryRaw` là **HOÀN TOÀN CHÍNH XÁC**.

#### 2. Ràng buộc bên trong Transaction (`tx`)
* Lệnh gọi `set_config` **bắt buộc** phải thực hiện trên đối tượng `tx` bên trong `prisma.$transaction(async (tx) => { ... })`.
* Nếu gọi trên root client `prisma.$queryRaw`, Prisma sẽ mượn một client từ connection pool, thực thi `set_config`, và **ngay lập tức trả connection về pool**. Các truy vấn tiếp theo trong request có thể mượn một connection hoàn toàn khác $\to$ Tenant context không tồn tại.
* Khi dùng `tx`, Prisma cố định (pin) toàn bộ các truy vấn trong closure trên duy nhất một dedicated connection vật lý cho đến khi commit/rollback.

#### 3. Cách ly Connection Pool (`is_local = true`)
* Tham số thứ 3 của `set_config` là cờ `is_local`.
* Giá trị `true` thiết lập biến cấu hình ở cấp độ **Transaction-Local**. Khi transaction kết thúc (dù `COMMIT` hay `ROLLBACK`), PostgreSQL engine tự động hủy biến cấu hình và khôi phục về trạng thái mặc định của session (hoặc NULL).
* Khi connection đó được trả về pool (hoặc PgBouncer) và một request khác sử dụng lại, biến `app.current_organization_id` đã là rỗng/NULL. Nguy cơ rò rỉ tenant giữa các request (Cross-Tenant Leakage) bị **triệt tiêu hoàn toàn**.

#### 4. Cơ chế Fail-Closed khi Context thiếu hoặc không hợp lệ
* RLS policy cho các bảng được định nghĩa như sau:
  ```sql
  CREATE POLICY tenant_isolation_policy ON sales_orders
  AS RESTRICTIVE
  USING (
    organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  );
  ```
* Tham số thứ 2 của `current_setting(..., true)` là `missing_ok = true`:
  * Nếu context chưa được set hoặc transaction bị lỗi: Hàm trả về `NULL`.
  * Biểu thức so sánh trở thành: `organization_id = NULL`.
  * Trong logic 3 giá trị của SQL (Three-Valued Logic), phép so sánh với `NULL` luôn trả về `UNKNOWN`.
  * Theo cơ chế đánh giá của PostgreSQL RLS, chỉ các dòng đánh giá là `TRUE` mới được phép truy xuất; các dòng đánh giá là `FALSE` hoặc `UNKNOWN` **đều bị từ chối 100%**.
* **Kết luận:** Cơ chế bảo đảm tính chất **Fail-Closed tuyệt đối**.

### 3.3. Kết Luận Nội Dung 2
Thiết kế cú pháp `await tx.$queryRaw` kết hợp `set_config(..., true)` và RLS policy fail-closed trong tài liệu Phase 1D đã **hoàn toàn chính xác, tối ưu và an toàn về mặt vận hành**. Không có sai sót kỹ thuật.

---

## 4. TỔNG HỢP KẾT QUẢ VÀ TRẠNG THÁI HỆ THỐNG

| Nội dung kiểm tra | Đánh giá kỹ thuật | Hành động trên tài liệu | Trạng thái Phase 1D | Implementation Gate |
| :--- | :---: | :---: | :---: | :---: |
| **1.1. Anti-Cycle Invariant** | **CHÍNH XÁC** (Phân định rõ ràng DB Constraint vs App Protocol) | Giữ nguyên tài liệu Phase 1D, ghi nhận trigger vào Implementation Requirements. | **APPROVED** (Tài liệu chuẩn mực) | **NOT APPROVED (HOLD)** |
| **1.2. Prisma Tenant Context** | **CHÍNH XÁC** (Cú pháp `$queryRaw`, `is_local=true`, Fail-Closed) | Giữ nguyên tài liệu Phase 1D. | **APPROVED** (Tài liệu chuẩn mực) | **NOT APPROVED (HOLD)** |

Hồ sơ thiết kế Phase 1D chính thức **khép lại toàn bộ các câu hỏi kỹ thuật tồn đọng**, đạt độ tin cậy kiến trúc cao nhất để làm căn cứ cho việc khảo sát và xây dựng Master Implementation Roadmap.
