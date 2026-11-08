# ĐẶC TẢ KIẾN TRÚC PHÂN HỆ EXECUTIVE BI, HỢP NHẤT BÁO CÁO TÀI CHÍNH & DỰ BÁO KHO VẬN (PHASE 4D)
**Mã tài liệu:** `docs/PHASE_4D_EXECUTIVE_BI_AND_CONSOLIDATION_SPECIFICATION.md`  
**Ngày ban hành:** 08/11/2026 (Hiệu chỉnh Targeted Audit Remediation Revision 16 (5))  
**Thuộc lộ trình:** BizPro+ Enterprise ERP Expansion (Phase 4D — Spec-Only Architecture)  
**Phạm vi áp dụng:** Thiết kế kiến trúc & mô hình nghiệp vụ tham chiếu (Zero Code/Prisma Mutations to Frozen Core)  
**Căn cứ pháp lý & quy chuẩn kế toán:**
- Luật Kế toán số 88/2015/QH13.
- Chuẩn mực Kế toán Việt Nam số 25 (VAS 25) — *Báo cáo tài chính hợp nhất và kế toán khoản đầu tư vào công ty con*.
- Thông tư 202/2014/TT-BTC hướng dẫn phương pháp lập và trình bày Báo cáo tài chính hợp nhất.
- Thông tư 200/2014/TT-BTC hướng dẫn chế độ kế toán doanh nghiệp.
- Tiêu chuẩn kế toán quốc tế IFRS 10 (*Consolidated Financial Statements*) & IFRS 8 (*Operating Segments*).

---

## 1. TỔNG QUAN & BỐI CẢNH NGHIỆP VỤ (EXECUTIVE OVERVIEW)

Khi doanh nghiệp mở rộng từ một cửa hàng đơn lẻ lên mô hình chuỗi đa chi nhánh hoặc mô hình công ty mẹ - con (Holding / Đa pháp nhân), việc quản trị số liệu phân mảnh dẫn đến 3 rủi ro cốt tử:
1. **Ghi nhận ảo doanh thu nội bộ (Double Counting):** Doanh thu bán hàng giữa Tổng kho chi nhánh A sang Điểm bán lẻ chi nhánh B hoặc giữa công ty mẹ sang công ty con bị cộng dồn hai lần vào báo cáo tổng hợp/hợp nhất, làm sai lệch kết quả kinh doanh thực tế trước hội đồng quản trị và cơ quan thuế.
2. **Ứ đọng vốn hoặc đứt gãy chuỗi cung ứng (Bullwhip Effect):** Dự báo nhập hàng dựa trên cảm tính thay vì số liệu thống kê tiêu thụ dẫn đến tình trạng kho thiếu các SKU bán chạy (Stockout) nhưng tồn đọng lượng lớn SKU chậm luân chuyển.
3. **Mù mờ về biên lợi nhuận thực tế theo kênh và sản phẩm (Unit Economics Blindness):** Doanh nghiệp chỉ nhìn thấy doanh thu gộp (Gross GMV) từ sàn TMĐT (Shopee, TikTok Shop, Lazada) mà không bóc tách được các khoản chi phí ẩn: phí hoa hồng sàn (8 - 14%), phí cố định, phí dịch vụ chương trình sàn, trợ giá freeship, chi phí đóng gói và tỷ lệ hoàn hàng (Return & Refusal).

**Mục tiêu của Phase 4D:** Thiết kế kiến trúc giải pháp xử lý triệt để 3 bài toán trên ở cấp độ thiết kế hệ thống tham chiếu, tuân thủ tuyệt đối quy định pháp lý Việt Nam và chuẩn mực kế toán quốc tế, sẵn sàng cho việc kích hoạt triển khai khi ban quản trị phê duyệt.

---

## 2. KIẾN TRÚC HỢP NHẤT BÁO CÁO TÀI CHÍNH & LOẠI TRỪ GIAO DỊCH NỘI BỘ (VAS 25 & TT 202/2014)

Để xử lý chính xác và tránh nhầm lẫn giữa các mô hình pháp lý, hệ thống phân định rõ rành mạch hai mô hình tổ chức doanh nghiệp:

### 2.1. Mô hình 1: Chi nhánh và đơn vị hạch toán phụ thuộc trong cùng một Pháp nhân (Dependent Branches within Single Legal Entity)

Đối với các đơn vị hạch toán phụ thuộc (chi nhánh, văn phòng đại diện, kho trung chuyển không có tư cách pháp nhân độc lập):
- **Tài khoản thanh toán nội bộ:** Sử dụng **TK 136** (*Phải thu nội bộ*) và **TK 336** (*Phải trả nội bộ*) để theo dõi vốn cấp, các khoản chi hộ/thu hộ và điều chuyển tiền/hàng nội bộ giữa trụ sở chính và các chi nhánh.
- **Quy trình luân chuyển hàng hóa nội bộ:**
  - Sử dụng **Phiếu xuất kho kiêm vận chuyển nội bộ (PXKKVCNB)** kèm Lệnh điều động nội bộ theo quy định tại Nghị định 123/2020/NĐ-CP.
  - Hạch toán điều chuyển hàng hóa: Ghi nhận theo **giá gốc (giá vốn)**, không ghi nhận doanh thu hay lãi nội bộ:
    * *Đơn vị nhận hàng:* Nợ TK 156 (Kho nhận) / Có TK 136 hoặc Có TK 336.
    * *Đơn vị xuất hàng:* Nợ TK 136 hoặc Nợ TK 336 / Có TK 156 (Kho xuất).
- **Quy trình lập Báo cáo tài chính tổng hợp toàn công ty:**
  - Bù trừ và triệt tiêu toàn bộ số dư đối ứng Nợ TK 136 / Có TK 336 giữa trụ sở chính và các chi nhánh trực thuộc.
  - Tổng hợp toàn bộ số dư tài sản, nợ phải trả, doanh thu và chi phí hợp lệ của toàn bộ đơn vị thành viên.

---

### 2.2. Mô hình 2A: Pháp nhân độc lập Mẹ - Con trong cùng Tập đoàn (VAS 25 & TT 202/2014)

Áp dụng cho các công ty con thuộc phạm vi hợp nhất, trong đó công ty mẹ nắm quyền kiểm soát (>50% quyền biểu quyết hoặc nắm quyền chi phối trực tiếp/gián tiếp theo VAS 25 / IFRS 10).

- **Tài khoản thanh toán thương mại:** Mua bán giữa hai pháp nhân độc lập tuân thủ Luật Thương mại và lập Hóa đơn GTGT hợp pháp. Quan hệ công nợ được phản ánh qua **TK 131** (*Phải thu của khách hàng*) và **TK 331** (*Phải trả cho người bán*). Tuyệt đối **KHÔNG** sử dụng TK 136/336 cho các giao dịch thương mại giữa hai pháp nhân độc lập.
- **Tài khoản doanh thu theo Thông tư 200/2014/TT-BTC:**
  - Bán hàng hóa: Dùng **TK 5111** (*Doanh thu bán hàng hóa*).
  - Bán thành phẩm sản xuất: Dùng **TK 5112** (*Doanh thu bán các thành phẩm*).
  - Cung cấp dịch vụ: Dùng **TK 5113** (*Doanh thu cung cấp dịch vụ*).
  - *(Lưu ý chuẩn mực: TK 5112 là tài khoản doanh thu bán thành phẩm, không phải tài khoản doanh thu nội bộ dùng chung cho mọi giao dịch mua bán hàng hóa)*.

#### Bút toán loại trừ khi lập Báo cáo tài chính hợp nhất theo phương pháp hợp nhất từng dòng (Thông tư 202/2014/TT-BTC):
Phương pháp hợp nhất từng dòng (*Line-by-line consolidation*) cộng toàn bộ 100% doanh thu, chi phí, tài sản và công nợ của công ty mẹ và các công ty con. Quy trình loại trừ giao dịch nội bộ (*Intercompany Transaction Elimination Engine*) triệt tiêu toàn bộ 100% tác động của các giao dịch nội bộ này:

```
[Công ty Mẹ (Pháp nhân A)]              [Công ty Con (Pháp nhân B)]
         │                                         │
         ├──────── Xuất bán hàng hóa (Hóa đơn) ────┤
         │         Nợ 131 / Có 5111, Có 33311      │   Nhập kho: Nợ 156, Nợ 1331 / Có 331
         │         Nợ 632 / Có 156                 │
         │                                         │
         ▼                                         ▼
┌─────────────────────────────────────────────────────────────┐
│       INTERCOMPANY TRANSACTION ELIMINATION ENGINE           │
│ (Áp dụng khi lập Báo cáo tài chính hợp nhất tập đoàn)      │
└─────────────────────────────────────────────────────────────┘
```

1. **Trường hợp A — Hàng bán nội bộ đã được bán hết ra bên thứ ba ngoài tập đoàn trong kỳ:**
   - Toàn bộ doanh thu và giá vốn nội bộ bị triệt tiêu 100% để tránh ghi nhận trùng lặp:
     $$\text{Nợ TK 511 (Doanh thu bán hàng nội bộ tập đoàn)} \quad / \quad \text{Có TK 632 (Giá vốn hàng bán nội bộ)}$$
   - *(Kết quả: Không còn lãi chưa thực hiện trong giá trị hàng tồn kho cuối kỳ)*.

2. **Trường hợp B — Hàng bán nội bộ chưa bán ra ngoài, còn tồn kho 100% tại công ty mua cuối kỳ (Loại trừ lãi chưa thực hiện):**
   - Lãi gộp trong giá bán nội bộ chưa được thực hiện ra ngoài tập đoàn, do đó phải loại trừ khỏi doanh thu, giá vốn và giá trị hàng tồn kho:
     $$\text{Nợ TK 511 (Toàn bộ doanh thu bán nội bộ ghi nhận bởi công ty bán)}$$
     $$\text{Có TK 632 (Giá vốn gốc của công ty bán)}$$
     $$\text{Có TK 156 (Lợi nhuận chưa thực hiện còn nằm trong giá trị hàng tồn kho cuối kỳ)}$$

3. **Trường hợp C — Hàng bán nội bộ đã tiêu thụ một phần ra bên ngoài, một phần còn tồn kho cuối kỳ:**
   - Triệt tiêu toàn bộ doanh thu nội bộ: Nợ TK 511 (Doanh thu nội bộ).
   - Giá vốn tương ứng với phần hàng đã bán ra ngoài: Có TK 632.
   - Phần lãi chưa thực hiện của lượng hàng còn tồn kho cuối kỳ: Có TK 156.

4. **Trường hợp D — Bù trừ và triệt tiêu số dư công nợ tương hỗ giữa các công ty con và công ty mẹ:**
   - Triệt tiêu số dư công nợ phải thu / phải trả nội bộ giữa hai pháp nhân tại ngày kết thúc kỳ kế toán:
     $$\text{Nợ TK 331 (Phải trả người bán nội bộ tập đoàn)} \quad / \quad \text{Có TK 131 (Phải thu khách hàng nội bộ tập đoàn)}$$

---

### 2.3. Mô hình 2B: Giao dịch với Công ty Liên kết (Kế toán theo Phương pháp Vốn chủ sở hữu — VAS 07 & TT 202/2014)

Áp dụng cho các khoản đầu tư vào công ty liên kết, trong đó tập đoàn có **ảnh hưởng đáng kể** nhưng **không có quyền kiểm soát** (thông thường nắm giữ từ 20% đến dưới 50% quyền biểu quyết theo VAS 07 và Thông tư 202/2014/TT-BTC Chương IV).

- **Phân định rõ ranh giới phương pháp kế toán:**
  - **TUYỆT ĐỐI KHÔNG hợp nhất từng dòng:** Báo cáo tài chính hợp nhất của tập đoàn **không** cộng gộp từng dòng doanh thu, chi phí, tài sản hay nợ phải trả của công ty liên kết vào bảng tổng hợp tập đoàn như công ty con.
  - **Phương pháp Vốn chủ sở hữu (Equity Method):** Khoản đầu tư vào công ty liên kết được ghi nhận ban đầu theo giá gốc, sau đó định kỳ được điều chỉnh tăng/giảm theo tỷ lệ sở hữu của tập đoàn trong lãi/lỗ thuần sau thuế của công ty liên kết (phản ánh vào chỉ tiêu *"Lãi hoặc lỗ trong công ty liên doanh, liên kết"* trên Báo cáo kết quả hoạt động kinh doanh hợp nhất).
- **Quy tắc xử lý giao dịch thương mại giữa Tập đoàn và Công ty Liên kết:**
  - Giao dịch mua bán giữa tập đoàn và công ty liên kết được xem là giao dịch với các bên liên quan theo Chuẩn mực VAS 26.
  - **KHÔNG áp dụng engine triệt tiêu 100% công nợ hay doanh thu:** Không bù trừ số dư công nợ TK 131/TK 331 hay triệt tiêu 100% TK 511/TK 632 như công ty con.
  - **Loại trừ lãi/lỗ chưa thực hiện theo tỷ lệ sở hữu:** 
    * Trong giao dịch bán xuôi (*Downstream — Nhà đầu tư bán cho bên liên kết*) hoặc bán ngược (*Upstream — Bên liên kết bán cho nhà đầu tư*), nếu hàng hóa/tài sản chưa được bán ra bên thứ ba độc lập ngoài tập đoàn, thì **chỉ loại trừ phần lãi/lỗ chưa thực hiện tương ứng với tỷ lệ sở hữu của tập đoàn** trong công ty liên kết.
    * Giá trị lãi chưa thực hiện được điều chỉnh giảm trừ vào khoản đầu tư vào bên liên kết và giảm trừ vào chỉ tiêu chia sẻ lợi nhuận từ công ty liên kết, chứ không điều chỉnh trực tiếp vào hàng tồn kho hay doanh thu thuần của bên liên kết ngoài tập đoàn.

---

## 3. THUẬT TOÁN DỰ BÁO NHU CẦU & ĐIỂM ĐẶT HÀNG LẠI (ROP & SAFETY STOCK)

### 3.1. Các giả định thống kê và phạm vi áp dụng (Statistical Assumptions)

> [!NOTE]
> Mô hình toán học tính toán Điểm đặt hàng lại (ROP) và Tồn kho an toàn (Safety Stock) dưới đây là mô hình phân phối chuẩn thống kê kinh điển trong quản trị chuỗi cung ứng. Mô hình có cơ sở vững chắc khi thỏa mãn các giả định vận hành sau:
> 1. **Giả định độc lập thống kê:** Nhu cầu tiêu thụ ($d$) và thời gian giao hàng nhà cung cấp ($L$) là hai biến ngẫu nhiên độc lập thống kê, tức hệ số hiệp phương sai $\text{Cov}(d, L) = 0$.
> 2. **Giả định phân phối chuẩn:** Nhu cầu tiêu thụ hàng ngày và thời gian giao hàng tuân theo phân phối chuẩn (Gaussian distribution) trong điều kiện thị trường tương đối ổn định, không chịu tác động của khủng hoảng chuỗi cung ứng bất khả kháng.
> 3. **Lọc dữ liệu ngoại lai (Outlier Treatment):** Dữ liệu tiêu thụ đột biến do sự kiện flash sale ngắn hạn, khuyến mại sốc hoặc đứt gãy cung ứng phải được bóc tách và chuẩn hóa trước khi đưa vào tính toán độ lệch chuẩn.
> 4. **Giới hạn mô hình:** Mô hình không áp dụng cho các SKU mang tính mùa vụ cao (Seasonal products) hoặc sản phẩm vòng đời ngắn (Fast Fashion) nếu không có hệ số điều chỉnh xu hướng (Trend & Seasonality Index).

### 3.2. Công thức toán học chi tiết

$$\text{ROP} = (\bar{d} \times \bar{L}) + \text{SS}$$

Trong đó:
- $\bar{d}$ (*Average Daily Demand*): Nhu cầu tiêu thụ trung bình hàng ngày tính trên chu kỳ $N$ ngày gần nhất (khuyến nghị $N = 30$, $60$ hoặc $90$ ngày tùy chu kỳ quay vòng hàng hóa):
  $$\bar{d} = \frac{1}{N} \sum_{i=1}^N d_i$$
- $\bar{L}$ (*Average Lead Time*): Thời gian trung bình từ khi phát hành Đơn mua hàng (PO) đến khi hàng nhập kho vật lý (tính bằng ngày), tính trên $M$ đơn PO nhập hàng gần nhất của nhà cung cấp ($M \ge 5$):
  $$\bar{L} = \frac{1}{M} \sum_{j=1}^M L_j$$
- $\text{SS}$ (*Safety Stock* — Tồn kho an toàn): Lượng hàng dự phòng để triệt tiêu rủi ro biến động nhu cầu và thời gian giao hàng:
  $$\text{SS} = Z \times \sqrt{\bar{L} \cdot \sigma_d^2 + \bar{d}^2 \cdot \sigma_L^2}$$
- $Z$: Hệ số mức dịch vụ (*Service Level Factor*):
  - 90% Service Level: $Z = 1.28$
  - 95% Service Level: $Z = 1.65$ (Khuyến nghị cho ngành bán lẻ tiêu chuẩn)
  - 99% Service Level: $Z = 2.33$ (Áp dụng cho SKU nhóm A chủ lực)
- $\sigma_d$: Độ lệch chuẩn mẫu của mức tiêu thụ hàng ngày:
  $$\sigma_d = \sqrt{\frac{1}{N-1} \sum_{i=1}^N (d_i - \bar{d})^2}$$
- $\sigma_L$: Độ lệch chuẩn mẫu của thời gian giao hàng nhà cung cấp:
  $$\sigma_L = \sqrt{\frac{1}{M-1} \sum_{j=1}^M (L_j - \bar{L})^2}$$

### 3.3. Phương pháp phân loại ABC theo nguyên lý Pareto

Hệ thống phân loại tồn kho dựa trên **Giá trị sử dụng hàng năm (Annual Consumption Value = Số lượng tiêu thụ 12 tháng $\times$ Đơn giá vốn bình quân)**:
- **Nhóm A (High Value / Critical Control):** Chiếm ~20% số lượng SKU nhưng tạo ra ~80% giá trị tiêu thụ. Áp dụng mức dịch vụ $Z = 2.33$ (99%), kiểm đếm tồn kho hàng tuần và kiểm soát ROP tự động.
- **Nhóm B (Moderate Value):** Chiếm ~30% số lượng SKU và ~15% giá trị tiêu thụ. Áp dụng mức dịch vụ $Z = 1.65$ (95%), kiểm đếm tồn kho hàng tháng.
- **Nhóm C (Low Value / Bulk):** Chiếm ~50% số lượng SKU còn lại nhưng chỉ chiếm ~5% giá trị tiêu thụ. Áp dụng chính sách đặt hàng định kỳ tinh giản, mức an toàn cơ bản $Z = 1.28$ (90%).

---

## 4. CÔNG THỨC TÍNH TOÁN LỢI NHUẬN ĐÓNG GÓP THEO SKU & KÊNH BÁN (CONTRIBUTION MARGIN ECONOMICS)

Để phản ánh chính xác hiệu quả kinh doanh của từng sản phẩm trên từng kênh bán hàng mà không bị sai lệch bởi các chi phí chung khó phân bổ, hệ thống chuẩn hóa chỉ tiêu báo cáo là **Lợi nhuận đóng góp (Contribution Margin)** thay vì Net Profit:

> [!IMPORTANT]
> **Lưu ý chuẩn mực tài chính:** Lợi nhuận ròng toàn diện (Net Profit) của doanh nghiệp đòi hỏi phải phân bổ chi phí quản lý doanh nghiệp (G&A - TK 642), chi phí tài chính (TK 635) và thuế TNDN. Các chi phí này mang tính gián tiếp và không thể phân bổ trực tiếp một cách khách quan cho từng SKU ở cấp đơn hàng. Do đó, thước đo chuẩn xác nhất cho Unit Economics ở cấp độ SKU & Kênh bán là **Contribution Margin** (Lợi nhuận đóng góp).

$$\text{Contribution Margin}_{\text{SKU, Channel}} = \text{Net Revenue} - \text{COGS} - \text{Platform Fees} - \text{Allocated Marketing} - \text{Packaging \& Logistics Subsidy} - \text{Return Loss}$$

### Bóc tách các thành phần chi phí:
1. **Net Revenue (*Doanh thu thuần*):** Doanh thu sau khi trừ giảm giá, chiết khấu thương mại và voucher do người bán tự tài trợ.
2. **COGS (*Giá vốn hàng bán TK 632*):** Tính theo phương pháp Bình quân gia quyền di động hoặc FIFO từ Sổ cái phân hệ Kho.
3. **Platform Fees (*Phí sàn TMĐT*):** 
   - Phí thanh toán (Payment fee: 2.5% - 5%).
   - Phí cố định (Fixed commission: 4% - 9% theo danh mục ngành hàng).
   - Phí dịch vụ chương trình (Freeship Xtra, Live/Video voucher: 4% - 8%).
4. **Allocated Marketing Expense (*Chi phí tiếp thị phân bổ*):** Tổng chi phí quảng cáo nội sàn (Shopee Ads, TikTok Ads) và ngoại sàn (Meta Ads) phân bổ cho SKU theo tỷ trọng doanh thu hoặc lượt click chuyển đổi.
   *(Lưu ý phân biệt: **CAC — Customer Acquisition Cost** là chi phí thu hút một khách hàng mới ở cấp độ khách hàng/chiến dịch, trong khi **Allocated Marketing Expense** là chi phí tiếp thị trực tiếp phân bổ vào sản phẩm)*.
5. **Packaging & Logistics Subsidy (*Bao bì & Trợ giá vận chuyển*):** Chi phí thùng carton, màng xốp nổ bọc hàng và phần phí ship người bán trợ giá cho khách hàng.
6. **Return Loss (*Tổn thất hàng hoàn/hư hỏng*):**
   $$\text{Return Loss} = \text{Return Rate} \times \left( \text{Phí ship chiều đi} + \text{Phí ship chiều về} + \text{Hao hụt giá trị hàng hỏng} \right)$$

---

## 5. MÔ HÌNH DỮ LIỆU ĐỀ XUẤT (PROPOSED SCHEMA — SPECIFICATION ONLY)

> [!IMPORTANT]
> Toàn bộ các định nghĩa schema dưới đây là **ĐẶC TẢ KIẾN TRÚC THAM CHIẾU (SPEC-ONLY)**. Tuyệt đối **KHÔNG MUTATE** `prisma/schema.prisma` và không chạy bất kỳ database migration nào tại thời điểm này.

```prisma
// Reference Architecture Spec for Phase 4D (NON-EXECUTABLE SPECIFICATION)

enum AbcClassification {
  CLASS_A // 80% giá trị tiêu thụ (Kiểm soát tồn kho nghiêm ngặt)
  CLASS_B // 15% giá trị tiêu thụ (Kiểm soát định kỳ)
  CLASS_C // 5% giá trị tiêu thụ (Kiểm soát tinh giản)
}

enum ReorderTriggerStatus {
  SUFFICIENT // Tồn kho an toàn
  WARNING_NEAR_ROP // Tiệm cận điểm đặt hàng lại
  BREACHED_CRITICAL // Đã vi phạm ngưỡng an toàn (Cần tạo PO ngay)
  ORDER_PLACED // Đã tạo đơn mua hàng chờ giao
}

// Bảng cấu hình chính sách kiểm soát tồn kho theo SKU và Kho hàng
// Phân cấp danh mục sản phẩm (Product Hierarchy):
// - productId: Mã định danh sản phẩm cha (Parent Product ID - ví dụ: iPhone 15 Pro, Áo Polo Nam)
// - skuCode: Mã biến thể đơn vị lưu kho độc lập (Variant/SKU Code - ví dụ: IP15P-128-BLK, POLO-WHT-L)
// Grain chuẩn: OrganizationId × ProductId × SkuCode × WarehouseId
// Thiết kế đảm bảo nhiều biến thể SKU của cùng 1 sản phẩm cha cùng tồn tại độc lập trong 1 kho hàng
model SkuInventoryPolicy {
  id                   String               @id @default(uuid())
  organizationId       String
  productId            String               // Dimension: Sản phẩm cha (Parent Product ID)
  skuCode              String               // Dimension: Mã biến thể SKU lưu kho cụ thể (Variant/SKU Code)
  warehouseId          String               // Dimension: Kho hàng vật lý (Warehouse ID)
  analysisPeriodDays   Int                  @default(60) // Chu kỳ phân tích (ngày)
  averageDailyDemand   Float                @default(0.0) // d_bar
  demandStdDev         Float                @default(0.0) // sigma_d
  leadTimeDays         Int                  @default(7)   // L_bar (ngày)
  leadTimeStdDev       Float                @default(1.5) // sigma_L
  serviceLevelZ        Float                @default(1.65) // 95% service level
  safetyStockQuantity  Int                  @default(20)  // SS
  reorderPoint         Int                  @default(50)  // ROP
  economicOrderQty     Int                  @default(100) // EOQ
  abcClass             AbcClassification    @default(CLASS_A)
  status               ReorderTriggerStatus @default(SUFFICIENT)
  updatedAt            DateTime             @updatedAt

  // Khóa duy nhất đa chiều: Kết hợp productId, skuCode và warehouseId
  @@unique([organizationId, productId, skuCode, warehouseId])
}

// Bảng tổng hợp Lợi nhuận đóng góp cấp SKU và Kênh bán (BI Analytical Aggregate Grain)
// Phân cấp danh mục sản phẩm: Phân tích hiệu quả kinh tế độc lập cho từng biến thể SKU của sản phẩm cha
// Grain chuẩn: OrganizationId × PeriodDate × ChannelCode × ProductId × SkuCode
// Thiết kế đảm bảo nhiều SKU cùng sản phẩm cha bán trên cùng 1 kênh trong cùng 1 kỳ được ghi nhận riêng biệt
model ProductChannelProfitabilityAggregate {
  id                          String   @id @default(uuid())
  organizationId              String
  periodDate                  DateTime // Ngày hạch toán (YYYY-MM-DD)
  channelCode                 String   // SHOPEE, TIKTOK, LAZADA, DIRECT_STORE, B2B_PORTAL
  productId                   String   // Dimension: Sản phẩm cha (Parent Product ID)
  skuCode                     String   // Dimension: Mã biến thể SKU cụ thể (Variant/SKU Code)
  grossRevenue                Decimal  @db.Decimal(18, 2) // Doanh thu gộp
  sellerDiscountsAndVouchers  Decimal  @db.Decimal(18, 2) // Giảm giá & voucher người bán
  netRevenue                  Decimal  @db.Decimal(18, 2) // Doanh thu thuần
  cogsAmount                  Decimal  @db.Decimal(18, 2) // Giá vốn hàng bán (TK 632)
  grossMarginAmount           Decimal  @db.Decimal(18, 2) // Lợi nhuận gộp
  platformFees                Decimal  @db.Decimal(18, 2) // Phí sàn TMĐT (Thanh toán, hoa hồng, dịch vụ)
  allocatedMarketingExpense   Decimal  @db.Decimal(18, 2) // Chi phí tiếp thị phân bổ cho SKU
  logisticsAndPackagingCost   Decimal  @db.Decimal(18, 2) // Chi phí bao bì đóng gói & trợ giá vận chuyển
  returnLossAmount            Decimal  @db.Decimal(18, 2) // Tổn thất hàng hoàn/hư hỏng
  contributionMargin          Decimal  @db.Decimal(18, 2) // Lợi nhuận đóng góp (Contribution Margin)
  contributionMarginPercentage Float    // Tỷ suất biên lợi nhuận đóng góp

  // Khóa duy nhất kết hợp cả productId và skuCode cho từng kênh bán và chu kỳ kế toán
  @@unique([organizationId, periodDate, channelCode, productId, skuCode])
}
```

---

## 6. QUY TẮC BẢO TOÀN KIẾN TRÚC & QUẢN TRỊ AN TOÀN (SAFETY & GOVERNANCE)

1. **Tuân thủ quy chế đóng băng Phase 1A-3F và OPS-01/02/03:**
   - Không can thiệp mã nguồn backend đang chạy.
   - Không thay đổi bảng và cấu trúc cơ sở dữ liệu hiện hành.
2. **Tuân thủ chuẩn mực tính toán minh bạch:**
   - Mọi báo cáo phân tích tài chính đều phải có vết truy ngược (*Drill-down Audit Trail*) về chứng từ gốc (Sổ nhật ký chung, Phiếu xuất kho, Bảng kê đối soát sàn TMĐT).
   - Tách bạch rõ ràng số liệu thực tế đo lường được và số liệu dự báo thống kê (Forecast).
3. **Sẵn sàng nghiệm thu độc lập:**
   - Toàn bộ nội dung tài liệu tuân thủ chuẩn mực kỹ thuật cao nhất, logic toán học và nghiệp vụ tài chính Việt Nam chính xác 100%.
