# UI/UX SPECIFICATION & DESIGN SYSTEM (CHUẨN BIZPRO+)
## BUSINESS MANAGEMENT SYSTEM (CRM + INVENTORY + HRM + SALES ORDER)
**Phiên bản:** 2.0 (Cập nhật chuẩn mẫu thiết kế BizPro+ Dashboard)  
**Phong cách:** Enterprise Clean Modern SaaS (Tương tự hình mẫu BizPro+)  
**Tông màu chủ đạo:** Royal Tech Blue (`#2563EB`), Soft Clean Slate Canvas (`#F8FAFC`), Pure White Cards (`#FFFFFF`), Dark Slate Sidebar (`#0F172A`)  
**Design Tokens:** Tailwind CSS v3/v4 + shadcn/ui + Lucide Icons + Recharts  

---

## 1. HỆ THỐNG MÀU SẮC & DESIGN TOKENS (BIZPRO+ PALETTE)

Dựa trên hình mẫu thiết kế giao diện **BizPro+**, hệ thống UI được quy chuẩn với các token sau:

### 1.1. Bảng màu giao diện (Color Palette)
- **Primary Brand (Chủ đạo):**  
  * `primary`: `#2563EB` (Blue 600 - Nút chính, Active Tab, Icon Brand, Gradient Accent)
  * `primary-hover`: `#1D4ED8` (Blue 700)
  * `primary-light`: `#EFF6FF` (Blue 50 - Background thẻ chọn, Badge nền nhẹ)
- **Canvas & Background:**  
  * `background`: `#F1F5F9` / `#F8FAFC` (Màu nền xám nhạt dịu mắt, làm nổi bật các thẻ dữ liệu màu trắng)
  * `card-background`: `#FFFFFF` (Nền thẻ card trắng tinh khiết, bóng đổ nhẹ `shadow-sm`, viền `border border-slate-100/80`, bo góc `rounded-2xl`)
- **Sidebar (Menu điều hướng bên trái):**  
  * Tùy chọn 1 (BizPro+ Clean Dark Slate): Nền `#0B132B` / `#0F172A`, Text `#94A3B8`, Active Text `#FFFFFF`, Active Item Background `#2563EB` bo góc `rounded-xl`.
  * Tùy chọn 2 (BizPro+ Pure White Modern): Nền `#FFFFFF`, viền phải `border-r border-slate-200`, Active Item Nền `#EFF6FF` chữ `#2563EB`.
- **Thang màu trạng thái & Biểu đồ (Status & Metrics Colors):**
  * **Xanh dương (Blue - Khách hàng mới & CRM):** `#3B82F6` | Light bg `#EFF6FF`
  * **Xanh lá (Emerald - Đơn hàng & Doanh thu thực):** `#10B981` | Light bg `#ECFDF5`
  * **Tím (Purple - Doanh thu & Dịch vụ):** `#8B5CF6` | Light bg `#F5F3FF`
  * **Cam (Amber/Orange - Tồn kho & Cảnh báo sắp hết):** `#F59E0B` | Light bg `#FFFBEB`
  * **Đỏ (Rose - Cần nhập hàng khẩn cấp & Thất bại):** `#EF4444` | Light bg `#FEF2F2`

### 1.2. Typography & Khoảng cách (Spacing & Radius)
- **Font gia đình:** Inter, Plus Jakarta Sans hoặc Be Vietnam Pro (tối ưu tiếng Việt có dấu hoàn hảo).
- **Bo góc (Border Radius):**
  * Card lớn: `rounded-2xl` (16px)
  * Button / Input / Select: `rounded-xl` (10px - 12px)
  * Badges: `rounded-full` hoặc `rounded-lg` (6px)
- **Shadow:** `shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)]` (Bóng mềm doanh nghiệp, không lem bẩn).

---

## 2. BỐ CỤC CHUẨN MÀN HÌNH TỔNG QUAN (BIZPRO+ DASHBOARD LAYOUT)

```
+--------------------------------------------------------------------------------------------------------------------+
| [Logo BizPro+]  | 🔍 [Tìm kiếm khách hàng, đơn hàng, sản phẩm... (Ctrl + K)]            | [🔔 3] | [Avatar Admin ▾] |
+-----------------+--------------------------------------------------------------------------------------------------+
| SIDEBAR (Left)  | TỔNG QUAN                                                                                        |
|                 | Chào mừng bạn trở lại! Dưới đây là tổng quan hoạt động của doanh nghiệp.     [📅 Tháng này ▾]   |
| 🏠 Tổng quan *  |--------------------------------------------------------------------------------------------------|
| 👥 CRM ▾        | [1. Khách hàng mới]     [2. Đơn hàng]           [3. Doanh thu]            [4. Tồn kho sẵn có]      |
|    - Khách hàng |  128                     256                     548.200.000đ              12.450                |
|    - Cơ hội     |  ↑ 12.5% [~~Blue Spark]  ↑ 18.7% [~~Green Spark] ↑ 22.1% [~~Purple Spark]  ↑ 5.3% [~~Orange Spark] |
|    - Lead       |--------------------------------------------------------------------------------------------------|
| 🛒 Bán hàng ▾   | +-----------------------------------+ +-----------------------+ +------------------------------+ |
|    - Đơn bán    | | 📊 Doanh thu theo thời gian       | | 🕒 Cơ cấu doanh thu   | | ⚡ Hoạt động gần đây   Xem tất | |
|    - Khách hàng | | • Tháng này  • Tháng trước        | |     548.2tr           | | 🛒 Đơn hàng #DH2567  (2p trc) | |
| 📦 Kho hàng ▾   | | [Line Chart 2 đường so sánh       | |    (Donut Chart 3 màu)| | 👤 Nhân viên mới     (5p trc) | |
|    - Sản phẩm   | |  với Tooltip 320.500.000đ]        | | • Sản phẩm: 45.2%     | | 📦 Nhập kho #NK0234 (10p trc) | |
|    - Nhập-Xuất  | |                                   | | • Dịch vụ: 34.1%      | | 📅 Đơn nghỉ phép    (15p trc) | |
|    - Kiểm kê    | |  T2  T3  T4  T5  T6  T7  CN       | | • Khác:    20.7%      | |                              | |
| 👔 Nhân sự ▾    | +-----------------------------------+ +-----------------------+ +------------------------------+ |
|    - Nhân viên  |--------------------------------------------------------------------------------------------------|
|    - Chấm công  | +-----------------------+ +-----------------------------------+ +------------------------------+ |
|    - Nghỉ phép  | | 🎯 CRM - Cơ hội KD    | | ⚠️ Cảnh báo tồn kho      Xem tất | | 👥 Tổng quan nhân sự        | |
| 📊 Báo cáo      | | [Funnel Chart Phễu]   | | • Laptop Dell XPS 13   [Cần nhập] | |  145 Tổng nhân sự (↑ 2.1%)   | |
| ⚙️ Cài đặt      | | • Mới:            120 | | • Chuột không dây      [Sắp hết]  | |  12 Nghỉ phép chờ duyệt      | |
|                 | | • Đã liên hệ:      85 | | • Bàn phím cơ Akko     [Sắp hết]  | |                              | |
| [Banner Pro]    | | • Đang đàm phán:   52 | |                                   | | [Minh họa nhân sự 3D/Vector] | |
| Nâng cấp ngay   | | • Thành công:      38 | | (Click xem chi tiết từng mặt hàng)| |                              | |
+-----------------+ +-----------------------+ +-----------------------------------+ +------------------------------+ +
```

---

## 3. CHI TIẾT 6 KHỐI DỮ LIỆU CỐT LÕI TRÊN BIZPRO+ DASHBOARD

### 3.1. Khối Header & Global Command Palette (Ctrl + K)
- **Ô tìm kiếm thông minh:** Nhấn phím nóng `Ctrl + K` (hoặc `Cmd + K` trên macOS) mở hộp thoại Modal Search hỗ trợ tìm kiếm tức thì:
  * Khách hàng: Tìm theo tên, số điện thoại, mã KH.
  * Đơn hàng: Tìm theo mã đơn `SO-xxxxx`.
  * Sản phẩm: Tìm theo tên SKU hoặc mã vạch.
- **Notification Dropdown:** Hiển thị số lượng thông báo chưa đọc (Badge màu đỏ `3`). Khi bấm mở popover hiển thị danh sách duyệt phép, đơn hàng cần xuất kho, cảnh báo tồn kho.
- **User Profile Menu:** Tên người dùng, vai trò ("Quản trị viên"), ảnh đại diện và menu đổi mật khẩu, đăng xuất.

### 3.2. Hàng 1: 4 Thẻ KPI Chỉ số chính (Metric Cards with Sparklines)
Mỗi thẻ được thiết kế dạng Card trắng, viền mảnh, bóng mềm, tích hợp biểu đồ mini dạng sóng (Sparkline):
1. **Khách hàng mới (New Customers):**
   - Icon: User Group màu xanh dương (Bg `#EFF6FF`, Icon `#3B82F6`).
   - Con số: `128` (Font size 28px, Bold 700).
   - Tăng trưởng: `↑ 12.5%` (Màu xanh lá `#10B981`).
   - Sóng mini chart màu xanh dương.
2. **Đơn hàng (Sales Orders):**
   - Icon: Giỏ hàng Shopping Cart màu xanh lá (Bg `#ECFDF5`, Icon `#10B981`).
   - Con số: `256`.
   - Tăng trưởng: `↑ 18.7%`.
   - Sóng mini chart màu xanh lá.
3. **Doanh thu (Revenue):**
   - Icon: Hộp quà/Tài chính màu tím (Bg `#F5F3FF`, Icon `#8B5CF6`).
   - Con số: `548.200.000đ`.
   - Tăng trưởng: `↑ 22.1%`.
   - Sóng mini chart màu tím.
4. **Tồn kho sẵn có (Available Stock):**
   - Icon: Thùng hàng Package màu cam (Bg `#FFFBEB`, Icon `#F59E0B`).
   - Con số: `12.450`.
   - Tăng trưởng: `↑ 5.3%`.
   - Sóng mini chart màu cam.

### 3.3. Hàng 2: Doanh thu theo thời gian, Cơ cấu & Hoạt động gần đây
1. **Biểu đồ Doanh thu theo thời gian (Line Chart so sánh):**
   - Thư viện: `Recharts` (`ResponsiveContainer`, `AreaChart` hoặc `LineChart`).
   - Trục hoành: Các thứ trong tuần (`T2`, `T3`, `T4`, `T5`, `T6`, `T7`, `CN`).
   - Trục tung: Mức doanh số (`0đ`, `100tr`, `200tr`, `300tr`, `400tr`).
   - 2 đường dữ liệu:
     * Đường đậm: **Tháng này** (Chấm điểm tròn với Tooltip nổi bật giá trị `320.500.000đ`).
     * Đường nhạt: **Tháng trước** (Để nhà quản lý so sánh tương quan tăng giảm).
2. **Biểu đồ Cơ cấu doanh thu (Donut / Pie Chart):**
   - Vòng tròn khuyết tâm, ở giữa ghi tổng: **`548.2tr` - Tổng doanh thu**.
   - 3 lát cắt màu sắc rõ ràng:
     * Sản phẩm: `45.2%` (Xanh dương)
     * Dịch vụ: `34.1%` (Vàng cam)
     * Khác: `20.7%` (Xanh ngọc / Emerald)
3. **Hoạt động gần đây (Recent Activities Timeline):**
   - Nút liên kết góc phải: "Xem tất cả $\rightarrow$".
   - Danh sách bản ghi thời gian thực:
     * Icon giỏ hàng xanh: `Đơn hàng #DH2567` - Khách hàng: Công ty ABC (2 phút trước).
     * Icon nhân sự xanh: `Nhân viên mới` - Trần Thị Bích được thêm vào phòng nhân sự (5 phút trước).
     * Icon thùng hàng cam: `Nhập kho #NK0234` - Từ nhà cung cấp: Công ty XYZ (10 phút trước).
     * Icon lịch tím: `Đơn nghỉ phép` - Nguyễn Văn B - 2 ngày (15 phút trước).

### 3.4. Hàng 3: CRM Funnel, Cảnh báo tồn kho & Nhân sự
1. **CRM - Cơ hội kinh doanh (Sales Pipeline Funnel):**
   - Hình phễu chuyển đổi 4 tầng:
     * Mới: `120` (Xanh dương)
     * Đã liên hệ: `85` (Xanh ngọc)
     * Đang đàm phán: `52` (Vàng)
     * Thành công: `38` (Tím)
2. **Cảnh báo tồn kho (Low Stock Alerts Widget):**
   - Nút "Xem tất cả $\rightarrow$" dẫn trực tiếp tới phân hệ Kho hàng.
   - Danh sách sản phẩm sắp chạm đáy tồn tối thiểu:
     * Thumbnail ảnh + `Laptop Dell XPS 13` (Còn 5 sản phẩm) $\rightarrow$ Badge đỏ **`Cần nhập`**.
     * Thumbnail ảnh + `Chuột không dây Logitech` (Còn 12 sản phẩm) $\rightarrow$ Badge cam **`Sắp hết`**.
     * Thumbnail ảnh + `Bàn phím cơ Akko` (Còn 8 sản phẩm) $\rightarrow$ Badge cam **`Sắp hết`**.
3. **Tổng quan nhân sự (HRM Overview Widget):**
   - Icon người dùng + Con số: **`145` Tổng nhân viên** (`↑ 2.1%`).
   - Icon lịch + Con số: **`12` Nghỉ phép chờ duyệt**.
   - Hình minh họa đội ngũ nhân sự công sở hiện đại tạo cảm giác trực quan, thân thiện.

---

## 4. CHI TIẾT CÁC MÀN HÌNH CHỨC NĂNG CON CỦA HỆ THỐNG

### 4.1. Phân hệ CRM
- **Màn hình Khách hàng (`/crm/customers`):** Table dạng lưới chuẩn BizPro+ gồm Mã KH, Tên đối tác, Nhóm khách, Số điện thoại, Email, Tổng doanh số mua, Công nợ hiện tại, Trạng thái hoạt động.
- **Màn hình Cơ hội bán hàng (`/crm/deals`):** Hỗ trợ chuyển đổi giữa dạng **Bảng dữ liệu** và dạng **Kanban kéo thả** trực quan (7 cột tương ứng 7 giai đoạn trong pipeline).
- **Màn hình Lead (`/crm/leads`):** Nút hành động nổi bật "Chuyển đổi thành Khách hàng" (Convert Lead) kích hoạt popup xác nhận không làm mất dữ liệu.

### 4.2. Phân hệ Bán hàng (Sales Orders)
- **Màn hình Danh sách Đơn bán hàng (`/sales/orders`):** Tab lọc trạng thái (`Tất cả`, `Chờ xác nhận`, `Đang giữ hàng`, `Đang giao`, `Hoàn thành`, `Đã hủy`).
- **Màn hình Tạo đơn hàng (`/sales/orders/create`):**
  * Auto-complete chọn khách hàng kèm hiển thị hạn mức công nợ.
  * Chọn kho xuất hàng.
  * Nhập sản phẩm có hiển thị live: `Tồn kho sẵn có` ngay dưới ô chọn sản phẩm.

### 4.3. Phân hệ Kho hàng (Inventory)
- **Màn hình Danh mục sản phẩm (`/inventory/products`):** Thẻ sản phẩm kèm ảnh đại diện, SKU, Barcode, Giá vốn, Giá niêm yết, Tổng tồn toàn bộ kho, Nút in tem mã vạch.
- **Màn hình Nhập - Xuất kho (`/inventory/receipts-issues`):** Phân chia rõ ràng giữa Phiếu nhập từ NCC và Phiếu xuất cho Đơn hàng.
- **Màn hình Kiểm kê (`/inventory/stocktakes`):** Giao diện đếm hàng hỗ trợ máy quét mã vạch cầm tay.

### 4.4. Phân hệ Nhân sự (HRM)
- **Màn hình Nhân viên (`/hrm/employees`):** Danh sách nhân sự kèm avatar, phòng ban, chức vụ, tình trạng hợp đồng.
- **Màn hình Chấm công (`/hrm/attendance`):** Nút bấm Check-in / Check-out nhanh kèm bản đồ GPS/IP văn phòng, bảng theo dõi công cả tháng.
- **Màn hình Nghỉ phép (`/hrm/leave`):** Form xin nghỉ phép hiển thị số ngày phép còn lại trong năm, danh sách chờ duyệt dành cho Quản lý.
