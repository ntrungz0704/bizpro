# ĐẶC TẢ KIẾN TRÚC QUẢN TRỊ NHÂN SỰ (HRM), TÍNH LƯƠNG TỰ ĐỘNG & CHẤM CÔNG GPS GEO-FENCING (PHASE 4G)

**Mã tài liệu:** `docs/PHASE_4G_HRM_AND_PAYROLL_SPECIFICATION.md`  
**Ngày ban hành:** 08/11/2026  
**Thuộc lộ trình:** BizPro+ Enterprise ERP Expansion (Phase 4G — Spec-Only Architecture)  
**Phạm vi áp dụng:** Thiết kế kiến trúc & mô hình nghiệp vụ tham chiếu (Zero Code/Prisma Mutations to Frozen Core)  
**Căn cứ pháp lý & chuẩn mực kỹ thuật:**
- Bộ luật Lao động số 45/2019/QH14 của Quốc hội nước CHXHCN Việt Nam.
- Nghị định 145/2020/NĐ-CP quy định chi tiết và hướng dẫn thi hành một số điều của Bộ luật Lao động về điều kiện lao động và quan hệ lao động.
- Luật Bảo hiểm xã hội số 41/2024/QH15 (Quy định tỷ lệ trích nộp BHXH, BHYT, BHTN và mức trần đóng bảo hiểm).
- Luật Thuế Thu nhập cá nhân & các Nghị quyết của Ủy ban Thường vụ Quốc hội về mức giảm trừ gia cảnh thuế TNCN.
- Tiêu chuẩn định vị toàn cầu WGS 84 và thuật toán Haversine đo khoảng cách mặt cầu.

---

## 1. TỔNG QUAN & BỐI CẢNH QUẢN TRỊ NHÂN SỰ DOANH NGHIỆP VIỆT NAM

Tại các doanh nghiệp đa chi nhánh, chuỗi cửa hàng bán lẻ hoặc phân phối tại Việt Nam, nghiệp vụ quản trị nhân sự (HRM) và tính lương thường gặp các rủi ro nghiêm trọng:
1. **Gian lận chấm công (Buddy Punching & GPS Spoofing):** Nhân viên nhờ người quẹt thẻ hộ trên máy vân tay, hoặc cài phần mềm giả lập vị trí GPS (*Fake GPS*) trên điện thoại để check-in từ xa mà không có mặt tại văn phòng/cửa hàng.
2. **Sai sót tính lương làm thêm giờ (Overtime - OT) & Ca kíp:** Bỏ sót hoặc tính sai hệ số làm thêm giờ theo quy định Bộ luật Lao động (150% ngày thường, 200% ngày nghỉ tuần, 300% ngày lễ tết), dẫn đến khiếu nại lao động hoặc vi phạm thanh tra lao động.
3. **Phức tạp trong trích nộp bảo hiểm bắt buộc và thuế TNCN:** Không tự động bóc tách các khoản phụ cấp miễn thuế (tiền ăn trưa, điện thoại, trang phục, công tác phí) và phụ cấp chịu thuế, dẫn đến quyết toán thuế TNCN cuối năm bị truy thu và phạt chậm nộp.

Phân hệ **BizPro+ Phase 4G** được thiết kế để giải quyết toàn diện các thách thức trên thông qua **Engine Chấm Công GPS Geo-fencing bảo mật cao** kết hợp **Engine Tính Lương Gross-to-Net tự động theo luật định Việt Nam**.

---

## 2. THUẬT TOÁN CHẤM CÔNG GPS GEO-FENCING & CHỐNG GIẢ LẬP TỌA ĐỘ

### 2.1. Công thức Haversine tính khoảng cách mặt cầu
Khi nhân viên bấm nút Chấm công trên thiết bị di động, hệ thống tiếp nhận tọa độ GPS thực tế của thiết bị $(\varphi_1, \lambda_1)$ và đối chiếu với tọa độ tâm của Chi nhánh / Văn phòng làm việc $(\varphi_0, \lambda_0)$:

$$a = \sin^2\left(\frac{\Delta \varphi}{2}\right) + \cos(\varphi_0) \cdot \cos(\varphi_1) \cdot \sin^2\left(\frac{\Delta \lambda}{2}\right)$$

$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$

$$d = R \cdot c$$

Trong đó:
- $\Delta \varphi = \varphi_1 - \varphi_0$ (Độ lệch vĩ độ tính bằng Radian).
- $\Delta \lambda = \lambda_1 - \lambda_0$ (Độ lệch kinh độ tính bằng Radian).
- $R = 6,371,000$ mét (Bán kính Trái Đất trung bình).
- $d$: Khoảng cách thực tế giữa vị trí nhân viên và tâm chi nhánh (mét).

**Quy tắc hợp lệ:**
- Nếu $d \le R_{\text{allowed}}$ (thông thường $R_{\text{allowed}} \le 100$ mét tùy mặt bằng tòa nhà): Chấm công **HỢP LỆ (VALID)**.
- Nếu $d > R_{\text{allowed}}$: Chấm công **NGOÀI BÁN KÍNH (OUT_OF_BOUNDS)**, bắt buộc nhân viên phải nhập lý do giải trình để quản lý trực tiếp duyệt ngoại lệ.

### 2.2. Cơ chế bảo vệ đa lớp chống giả mạo GPS (Anti-Spoofing Protocol)
1. **Kiểm tra Mock Location Flag:** Đọc cờ `isMockLocation` từ hệ điều hành Android / iOS. Nếu cờ này bật $\to$ Lập tức từ chối check-in và ghi log cảnh báo an ninh.
2. **Kiểm tra BSSID Wi-Fi Văn phòng (Wi-Fi Fingerprinting):** Xác thực mã địa chỉ MAC của Access Point Wi-Fi văn phòng mà điện thoại đang kết nối.
3. **Phát hiện dịch chuyển bất thường (Velocity Check):** So sánh thời gian và khoảng cách giữa 2 lượt check-in liên tiếp. Nếu vận tốc di chuyển tính toán vượt quá giới hạn vật lý (ví dụ: > 120 km/h) $\to$ Đưa vào danh sách xem xét gian lận.

---

## 3. CƠ CHẾ TÍNH LƯƠNG GROSS-TO-NET & THUẾ TNCN THEO LUẬT ĐỊNH

### 3.1. Cấu trúc Thu Nhập Toàn Diện
$$\text{Lương Tổng (Gross)} = \text{Lương Cơ Bản} + \text{Phụ Cấp Chịu Thuế} + \text{Phụ Cấp Miễn Thuế} + \text{Tiền Làm Thêm Giờ (OT)} + \text{Thưởng KPI}$$

1. **Hệ số Làm thêm giờ (Bộ luật Lao động 2019 - Điều 98):**
   - Làm thêm vào ngày làm việc bình thường: Tối thiểu bằng **150%** đơn giá lương ngày làm việc.
   - Làm thêm vào ngày nghỉ hàng tuần: Tối thiểu bằng **200%** đơn giá lương ngày làm việc.
   - Làm thêm vào ngày nghỉ lễ, tết, ngày nghỉ có hưởng lương: Tối thiểu bằng **300%** (chưa kể tiền lương của ngày nghỉ lễ, tết).
2. **Khoản phụ cấp miễn thuế TNCN hợp lệ (Thông tư 111/2013/TT-BTC & Thông tư 92/2015/TT-BTC):**
   - Tiền ăn trưa/giữa ca (tối đa theo quy định hiện hành hoặc giá trị suất ăn do doanh nghiệp tổ chức).
   - Tiền trang phục (tối đa 5.000.000 VNĐ/người/năm nếu chi bằng tiền mặt).
   - Tiền điện thoại, công tác phí theo quy chế nội bộ phục vụ sản xuất kinh doanh.
   - Phần tiền lương làm thêm giờ cao hơn tiền lương làm trong giờ tiêu chuẩn (phần vượt 100%).

### 3.2. Trích nộp Bảo hiểm Bắt buộc (Luật BHXH số 41/2024/QH15)

| Loại quỹ bảo hiểm | Người lao động đóng (Trừ vào lương) | Người sử dụng lao động đóng (Chi phí DN) | Tổng tỷ lệ trích nộp |
| :--- | :---: | :---: | :---: |
| **Bảo hiểm Xã hội (BHXH)** | 8.0% | 17.5% (gồm 14% hưu trí/tử tuất, 3% ốm đau/thai sản, 0.5% BNN-TNLĐ) | 25.5% |
| **Bảo hiểm Y tế (BHYT)** | 1.5% | 3.0% | 4.5% |
| **Bảo hiểm Thất nghiệp (BHTN)** | 1.0% | 1.0% | 2.0% |
| **Kinh phí Công đoàn (KPCĐ)** | 0.0% | 2.0% (Quỹ công đoàn cấp trên) | 2.0% |
| **TỔNG CỘNG** | **10.5%** | **23.5%** | **34.0%** |

*(Lưu ý: Mức lương đóng BHXH, BHYT tối đa không quá 20 lần mức lương cơ sở; mức đóng BHTN không quá 20 lần mức lương tối thiểu vùng theo quy định pháp luật)*.

### 3.3. Thuế Thu Nhập Cá Nhân (TNCN) Lũy Tiến Từng Phần

$$\text{Thu Nhập Chịu Thuế (TNCT)} = \text{Tổng Thu Nhập} - \text{Các Khoản Miễn Thuế}$$

$$\text{Thu Nhập Tính Thuế (TNTT)} = \text{TNCT} - \text{Bảo Hiểm Bắt Buộc (10.5%)} - \text{Giảm Trừ Bản Thân} - \text{Giảm Trừ Người Phụ Thuộc}$$

**Biểu thuế lũy tiến từng phần (7 bậc theo Luật Thuế TNCN):**
- Bậc 1: TNTT đến 5 triệu VNĐ $\to$ Thuế suất 5%
- Bậc 2: TNTT trên 5 triệu đến 10 triệu VNĐ $\to$ Thuế suất 10%
- Bậc 3: TNTT trên 10 triệu đến 18 triệu VNĐ $\to$ Thuế suất 15%
- Bậc 4: TNTT trên 18 triệu đến 32 triệu VNĐ $\to$ Thuế suất 20%
- Bậc 5: TNTT trên 32 triệu đến 52 triệu VNĐ $\to$ Thuế suất 25%
- Bậc 6: TNTT trên 52 triệu đến 80 triệu VNĐ $\to$ Thuế suất 30%
- Bậc 7: TNTT trên 80 triệu VNĐ $\to$ Thuế suất 35%

$$\text{Lương Thực Lĩnh (Net)} = \text{Lương Gross} - \text{Bảo Hiểm Bắt Buộc (10.5%)} - \text{Thuế TNCN} - \text{Các Khoản Trừ Khác (Tạm ứng, Quỹ)}$$

---

## 4. QUY TRÌNH HẠCH TOÁN TIỀN LƯƠNG LIÊN THÔNG SỔ CÁI KẾ TOÁN (TT 200/2014)

Hàng tháng, khi bảng lương được phê duyệt, hệ thống tự động sinh bút toán kế toán:
1. **Tính tiền lương phải trả cho người lao động:**
   - Nợ TK 641 (*Chi phí bán hàng - Bộ phận Sales, Marketing*)
   - Nợ TK 642 (*Chi phí quản lý doanh nghiệp - Bộ phận Hành chính, Kế toán, HR*)
   - Nợ TK 622 (*Chi phí nhân công trực tiếp - Công nhân phân xưởng sản xuất*)
   - Có TK 334 (*Phải trả người lao động*)
2. **Trích bảo hiểm tính vào chi phí doanh nghiệp (23.5%):**
   - Nợ TK 641, 642, 622 / Có TK 3383 (BHXH 17.5%), Có TK 3384 (BHYT 3%), Có TK 3386 (BHTN 1%), Có TK 3382 (KPCĐ 2%)
3. **Trích bảo hiểm từ tiền lương của người lao động (10.5%):**
   - Nợ TK 334 / Có TK 3383 (8%), Có TK 3384 (1.5%), Có TK 3386 (1%)
4. **Khấu trừ thuế TNCN phải nộp:**
   - Nợ TK 334 / Có TK 3335 (*Thuế thu nhập cá nhân*)
5. **Thanh toán tiền lương cho người lao động qua Ngân hàng:**
   - Nợ TK 334 / Có TK 1121 (*Tiền gửi ngân hàng*)

---

## 5. MÔ HÌNH DỮ LIỆU ĐỀ XUẤT (PROPOSED SCHEMA — SPECIFICATION ONLY)

> [!IMPORTANT]
> Toàn bộ các định nghĩa model dưới đây là **ĐẶC TẢ KIẾN TRÚC THAM CHIẾU (SPEC-ONLY)** cho Phân hệ Quản trị Nhân sự & Tính Lương. Tuyệt đối **KHÔNG MUTATE** `prisma/schema.prisma` và không chạy bất kỳ database migration nào tại thời điểm này.

```prisma
// Reference Architecture Spec for Phase 4G (NON-EXECUTABLE SPECIFICATION)

enum AttendanceVerificationStatus {
  VALID           // Hợp lệ trong bán kính cho phép
  OUT_OF_BOUNDS   // Ngoài bán kính GPS (Cần duyệt ngoại lệ)
  MOCK_DETECTED   // Phát hiện gian lận giả lập vị trí
  MANUAL_ADJUSTED // Đã được quản lý hiệu chỉnh hợp lệ
}

enum PayrollStatus {
  DRAFT
  CALCULATED
  REVIEWED
  APPROVED
  PAID
}

// Bảng cấu hình tọa độ Chi nhánh / Văn phòng chấm công (Geo-fence Policy)
model BranchGeoFencePolicy {
  id               String   @id @default(uuid())
  organizationId   String
  branchName       String   // Trụ sở chính Keangnam Hà Nội, Chi nhánh Bitexco Q1...
  latitude         Float    // Tọa độ Vĩ độ WGS84
  longitude        Float    // Tọa độ Kinh độ WGS84
  radiusMeters     Float    @default(100.0) // Bán kính cho phép (mét)
  allowedWifiBssids String[] // Danh sách MAC BSSID wifi văn phòng
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())

  @@index([organizationId, branchName])
}

// Bảng nhật ký chấm công GPS thời gian thực
model AttendanceLog {
  id                 String                       @id @default(uuid())
  organizationId     String
  userId             String
  checkinTime        DateTime                     @default(now())
  checkoutTime       DateTime?
  clientLatitude     Float                        // Vĩ độ thực tế khi bấm Check-in
  clientLongitude    Float                        // Kinh độ thực tế khi bấm Check-in
  distanceMeters     Float                        // Khoảng cách Haversine tính toán (mét)
  status             AttendanceVerificationStatus @default(VALID)
  isMockLocation     Boolean                      @default(false)
  wifiBssid          String?
  deviceUuid         String
  approvalNotes      String?
  approvedByUserId   String?

  @@index([organizationId, userId, checkinTime])
}

// Bảng cấu hình cấu trúc lương của nhân viên (Salary Structure)
model EmployeeSalaryProfile {
  id                 String   @id @default(uuid())
  organizationId     String
  userId             String   @unique
  baseSalaryGross    Decimal  @db.Decimal(18, 2) // Lương cơ bản theo hợp đồng
  allowanceLunch     Decimal  @default(0) @db.Decimal(18, 2) // Phụ cấp ăn trưa (Miễn thuế)
  allowancePhone     Decimal  @default(0) @db.Decimal(18, 2) // Phụ cấp điện thoại (Miễn thuế)
  allowanceTransport Decimal  @default(0) @db.Decimal(18, 2) // Phụ cấp xăng xe (Chịu thuế)
  dependentCount     Int      @default(0) // Số người phụ thuộc giảm trừ gia cảnh
  insuranceSalary    Decimal  @db.Decimal(18, 2) // Mức lương đóng bảo hiểm bắt buộc
  bankAccountNumber  String?
  bankName           String?
  updatedAt          DateTime @updatedAt
}

// Bảng chi tiết Phiếu lương hàng tháng (Monthly Payroll Slip)
model MonthlyPayrollSlip {
  id                   String        @id @default(uuid())
  organizationId       String
  userId               String
  periodMonth          String        // YYYY-MM (Ví dụ: 2026-11)
  status               PayrollStatus @default(DRAFT)
  
  // Thu nhập thực tế
  actualWorkDays       Float         @default(22.0)
  standardWorkDays     Float         @default(22.0)
  earnedBaseSalary     Decimal       @db.Decimal(18, 2)
  earnedAllowances     Decimal       @db.Decimal(18, 2)
  overtimePay          Decimal       @default(0) @db.Decimal(18, 2)
  kpiBonus             Decimal       @default(0) @db.Decimal(18, 2)
  grossTotalIncome     Decimal       @db.Decimal(18, 2) // Tổng Gross

  // Các khoản giảm trừ
  employeeBhxh         Decimal       @db.Decimal(18, 2) // 8%
  employeeBhyt         Decimal       @db.Decimal(18, 2) // 1.5%
  employeeBhtn         Decimal       @db.Decimal(18, 2) // 1%
  personalIncomeTax    Decimal       @default(0) @db.Decimal(18, 2) // Thuế TNCN lũy tiến
  otherDeductions      Decimal       @default(0) @db.Decimal(18, 2)
  netTakeHomePay       Decimal       @db.Decimal(18, 2) // Thực lĩnh Net

  // Chi phí người sử dụng lao động (Doanh nghiệp chịu)
  employerBhxh         Decimal       @db.Decimal(18, 2) // 17.5%
  employerBhyt         Decimal       @db.Decimal(18, 2) // 3%
  employerBhtn         Decimal       @db.Decimal(18, 2) // 1%
  employerUnionFee     Decimal       @db.Decimal(18, 2) // 2% KPCĐ
  totalCompanyCost     Decimal       @db.Decimal(18, 2) // Tổng chi phí quỹ lương công ty

  createdAt            DateTime      @default(now())

  @@unique([organizationId, userId, periodMonth])
}
```

---

## 6. QUY TẮC BẢO TOÀN KIẾN TRÚC & QUẢN TRỊ AN TOÀN (SAFETY & GOVERNANCE)

1. **Tuân thủ quy chế đóng băng nghiêm ngặt:**
   - Các phân hệ Phase 1A–3F, OPS-01/02/03 và Phase 4A–4F tiếp tục duy trì trạng thái đóng băng 100%.
   - Đặc tả Phase 4G được lưu trữ tại `docs/PHASE_4G_HRM_AND_PAYROLL_SPECIFICATION.md` ở trạng thái SPEC-ONLY. Không thay đổi file Prisma hoặc chạy lệnh database migration nào.
2. **Minh bạch hóa tính toán quyền lợi người lao động:**
   - Bảng tính lương tự động bảo đảm chuẩn mực pháp lý về trích nộp bảo hiểm và thuế TNCN Việt Nam, hỗ trợ xuất phiếu lương điện tử (Payslip) minh bạch cho người lao động.
   - Gắn nhãn minh họa rõ ràng cho mọi kịch bản demo trên giao diện web.
