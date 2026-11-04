# KNOWN ISSUES & TECHNICAL DEFECTS CATALOG: BIZPRO+
**DANH MỤC LỖI KỸ THUẬT, LỖ HỔNG VÀ ĐIỂM CHƯA HOÀN THIỆN ĐƯỢC PHÁT HIỆN QUA AUDIT**

* **Quy chuẩn ghi nhận:** Sự thật tuyệt đối, minh bạch mức độ nghiêm trọng và nguyên nhân gốc rễ (Root Cause).

---

## BẢNG THỐNG KÊ LỖI KỸ THUẬT THEO MỨC ĐỘ

| Mức độ nghiêm trọng | Số lượng phát hiện | Tác động chính |
|---|:---:|---|
| 🔴 **CRITICAL** | 2 | Nguy cơ mất toàn bộ dữ liệu khi reload; Không có hệ thống xác thực Backend. |
| 🟠 **HIGH** | 3 | Tranh chấp tồn kho đồng thời (Race Condition); Chưa có kiểm thử tự động; Chưa có Git. |
| 🟡 **MEDIUM** | 2 | Thiếu kiểm tra trùng lặp trên DB; Chấm công chưa chống gian lận. |
| 🟢 **LOW** | 1 | Chưa có file export Excel thật (mới hiển thị alert mẫu). |
| **TỔNG CỘNG** | **8** | Toàn bộ 8 lỗi kỹ thuật đã được phân loại và lập danh mục chi tiết bên dưới. |

---

## CHI TIẾT TỪNG LỖI KỸ THUẬT (DEFECT DETAILS)

### 1. `ISSUE-01`: Dữ liệu bị biến mất hoàn toàn khi tải lại trang (Data Volatility on Reload)
* **Mức độ nghiêm trọng:** 🔴 **CRITICAL**
* **Tệp tin ảnh hưởng:** [AppContext.tsx](file:///e:/dự%20án/frontend/src/context/AppContext.tsx)
* **Nguyên nhân gốc rễ (Root Cause):**
  * Toàn bộ trạng thái của hệ thống (Khách hàng mới tạo, Đơn bán hàng mới lập, Tồn kho biến động, Phiếu xuất/nhập, Chấm công, Đơn nghỉ phép) chỉ được lưu trữ trong bộ nhớ tạm (In-Memory React State) của client browser.
  * Dự án hoàn toàn chưa có dịch vụ Backend API và Database PostgreSQL kết nối.
* **Hậu quả:** Khi người dùng bấm phím F5, đóng tab hoặc mở tab ẩn danh, toàn bộ dữ liệu vừa nhập bị xóa sạch và reset về mảng mock tĩnh khởi tạo ban đầu.
* **Giải pháp khắc phục:**
  * Xây dựng tầng Backend API (NestJS) kết nối PostgreSQL để lưu trữ dữ liệu vĩnh viễn (Persistence).
  * Chuyển đổi tầng State trên Frontend sang gọi API thông qua TanStack Query (React Query).

---

### 2. `ISSUE-02`: Thiếu cơ chế xác thực và bảo vệ phân quyền ở Backend (No Server-Side Auth & RBAC)
* **Mức độ nghiêm trọng:** 🔴 **CRITICAL**
* **Tệp tin ảnh hưởng:** Toàn bộ thư mục `frontend/src/app/*`
* **Nguyên nhân gốc rễ (Root Cause):**
  * Frontend chưa có trang đăng nhập (`/login`), không kiểm tra JWT token hay Session cookie.
  * Không có Middleware chặn route của Next.js, bất kỳ ai cũng có thể truy cập `/settings` hay `/hrm/employees`.
  * Không có Backend API để kiểm tra quyền hạn thực tế (Permission Code + Data Scope).
* **Hậu quả:** Hệ thống không an toàn, có thể bị bất kỳ ai xem hoặc chỉnh sửa dữ liệu nội bộ.
* **Giải pháp khắc phục:**
  * Triển khai `AuthModule` trên NestJS với JWT Access Token + Refresh Token và mã hóa mật khẩu Argon2id.
  * Thêm `Next.js Middleware` để chuyển hướng về `/login` nếu chưa đăng nhập.
  * Áp dụng `@Roles()` và `@Permissions()` decorator trên mọi controller endpoint.

---

### 3. `ISSUE-03`: Nguy cơ bán vượt tồn kho khi có tranh chấp đồng thời (Overselling via Race Condition)
* **Mức độ nghiêm trọng:** 🟠 **HIGH**
* **Tệp tin ảnh hưởng:** [AppContext.tsx:710-730](file:///e:/dự%20án/frontend/src/context/AppContext.tsx#L710-L730)
* **Nguyên nhân gốc rễ (Root Cause):**
  * Hàm `confirmSalesOrder` chỉ kiểm tra tồn kho cục bộ trên trình duyệt của từng máy trạm.
  * Nếu 2 nhân viên cùng bấm xác nhận đơn hàng cho cùng 1 mặt hàng có số lượng tồn khả dụng còn lại là 1, cả 2 máy đều đọc thấy còn hàng và xác nhận thành công.
* **Hậu quả:** Tồn kho khả dụng bị âm (`Available < 0`), dẫn đến bán vượt quá số lượng hàng có trong kho.
* **Giải pháp khắc phục:**
  * Bắt buộc chuyển logic giữ hàng sang Backend Transaction trên PostgreSQL sử dụng lệnh khóa dòng:
    `SELECT * FROM inventory_balances WHERE product_id = $1 FOR UPDATE`.
  * Thiết lập ràng buộc cứng `CHECK (on_hand >= reserved)` trên PostgreSQL.

---

### 4. `ISSUE-04`: Dự án chưa được quản lý bằng Git Version Control (No Git Repository)
* **Mức độ nghiêm trọng:** 🟠 **HIGH**
* **Tệp tin ảnh hưởng:** Toàn bộ thư mục gốc `e:\dự án`
* **Nguyên nhân gốc rễ (Root Cause):**
  * Thư mục `e:\dự án` chưa được chạy lệnh `git init`. Không có thư mục `.git`, không có lịch sử commit hay nhánh (branch).
* **Hậu quả:** Không thể truy vết thay đổi mã nguồn, không có cơ chế rollback an toàn nếu gặp sự cố hỏng file.
* **Giải pháp khắc phục:**
  * Khởi tạo `git init` ngay lập tức tại thư mục gốc `e:\dự án`.
  * Tạo tệp tin `.gitignore` chuẩn (loại trừ `node_modules`, `.next`, `dist`, `.env`).
  * Thực hiện commit cơ sở đầu tiên (Baseline Commit).

---

### 5. `ISSUE-05`: Chưa có hệ thống kiểm thử tự động (Zero Automated Tests)
* **Mức độ nghiêm trọng:** 🟠 **HIGH**
* **Tệp tin ảnh hưởng:** `frontend/package.json`
* **Nguyên nhân gốc rễ (Root Cause):**
  * Trong dự án không có bất kỳ file test nào (`*.test.*`, `*.spec.*`). Không có Vitest, Jest hay Playwright.
* **Hậu quả:** Không thể tự động kiểm chứng các quy tắc bất biến khi có thay đổi mã nguồn.
* **Giải pháp khắc phục:**
  * Cài đặt Vitest cho Unit Test và Integration Test.
  * Viết test tự động cho các luồng nghiệp vụ cốt lõi: Tính toán tồn kho, Chuyển đổi Lead, Khóa đơn hàng.

---

### 6. `ISSUE-06`: Chuyển đổi Lead chưa kiểm tra trùng lặp trên cơ sở dữ liệu (Lead Conversion Duplicate Risk)
* **Mức độ nghiêm trọng:** 🟡 **MEDIUM**
* **Tệp tin ảnh hưởng:** [AppContext.tsx:645-660](file:///e:/dự%20án/frontend/src/context/AppContext.tsx#L645-L660)
* **Nguyên nhân gốc rễ (Root Cause):**
  * Hàm `convertLead` chỉ đổi trạng thái Lead thành `CONVERTED` và tạo một khách hàng mới trong RAM mà không kiểm tra xem số điện thoại hoặc email của Lead này đã tồn tại trong danh sách khách hàng chính thức hay chưa.
* **Hậu quả:** Gây phân mảnh và trùng lặp hồ sơ khách hàng.
* **Giải pháp khắc phục:**
  * Khi chuyển đổi Lead trên Backend, chạy câu lệnh truy vấn tìm kiếm trùng lặp theo `phone` hoặc `email`. Nếu trùng, đưa ra tùy chọn gộp vào khách hàng đã có hoặc cập nhật thông tin.

---

### 7. `ISSUE-07`: Chấm công có thể bị gian lận hoặc bấm trùng nhiều lần (Attendance Duplicate Punch Risk)
* **Mức độ nghiêm trọng:** 🟡 **MEDIUM**
* **Tệp tin ảnh hưởng:** [AppContext.tsx:880-920](file:///e:/dự%20án/frontend/src/context/AppContext.tsx#L880-L920)
* **Nguyên nhân gốc rễ (Root Cause):**
  * Lấy giờ hệ thống từ máy trạm của client (`new Date()`). Người dùng có thể chỉnh giờ trên máy tính cá nhân để gian lận giờ vào/ra.
* **Hậu quả:** Dữ liệu chấm công không có độ tin cậy để làm căn cứ tính lương.
* **Giải pháp khắc phục:**
  * Giờ chấm công phải được lấy độc quyền từ máy chủ Backend (`CURRENT_TIMESTAMP`).
  * Khóa chống check-in trùng lặp: nếu đã có bản ghi trong ngày mà chưa check-out, không cho phép check-in lại.

---

### 8. `ISSUE-08`: Nút Xuất Excel và In ấn chỉ hiển thị hộp thoại Alert mẫu (Mock Export & Print)
* **Mức độ nghiêm trọng:** 🟢 **LOW**
* **Tệp tin ảnh hưởng:** [reports/page.tsx:55-75](file:///e:/dự%20án/frontend/src/app/reports/page.tsx#L55-L75)
* **Nguyên nhân gốc rễ (Root Cause):**
  * Các nút "Xuất file Excel" và "In báo cáo" hiện đang gán sự kiện `onClick={() => alert(...)}`.
* **Hậu quả:** Người dùng chưa thể tải về file Excel thật hay xuất bản in PDF.
* **Giải pháp khắc phục:**
  * Viết API endpoint `/api/reports/export-excel` sử dụng thư viện `exceljs` để sinh file `.xlsx` thật.
  * Tích hợp chuẩn CSS `@media print` để hỗ trợ xuất in trang báo cáo.
