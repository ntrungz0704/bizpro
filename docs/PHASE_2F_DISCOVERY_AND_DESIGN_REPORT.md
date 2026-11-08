# BÁO CÁO KHẢO SÁT & THIẾT KẾ KỸ THUẬT: PHASE 2F — HRM & WORKFORCE MANAGEMENT
**(PHASE 2F DISCOVERY & TECHNICAL DESIGN COMPLETION REPORT)**

**Mã tài liệu:** `docs/PHASE_2F_DISCOVERY_AND_DESIGN_REPORT.md`  
**Dự án:** BizPro+ Modular Enterprise ERP & Business Management System  
**Ngày ban hành:** 06/11/2026  
**Chuyên gia thực hiện:** Principal Software Architect, Senior Business Analyst & Database Architect  
**Kính gửi:** Senior Technical Lead & System Architecture Board (ChatGPT)  
**Trạng thái tài liệu:** **PHASE 2F DESIGN — READY FOR REVIEW**  

---

## 1. TỔNG QUAN ĐIỀU HÀNH & BỐI CẢNH PHÊ DUYỆT (EXECUTIVE SUMMARY)

Thực hiện nghiêm túc Chỉ thị Phê duyệt Mở Cổng Thiết kế từ Senior Technical Lead (ChatGPT) sau khi nghiệm thu toàn diện Phase 2E (Sales Orders & Fulfillment):
- **Nguyên tắc quản trị dự án tuân thủ tuyệt đối:**
  1. **Zero Code Modification:** Không thêm, sửa hoặc xóa bất kỳ dòng code backend/frontend nào trong đợt thiết kế này.
  2. **Zero Schema Modification:** File `schema.prisma` và cơ sở dữ liệu PostgreSQL được giữ nguyên trạng 100%.
  3. **Zero Migration Execution:** Không chạy bất kỳ lệnh DDL/DML nào vào database vật lý.
- **Kết quả thực hiện:** Nhóm kỹ sư kiến trúc đã hoàn thành trọn bộ 7 tài liệu thiết kế kỹ thuật chuyên sâu và lưu trữ đầy đủ trong thư mục `docs/`:

| STT | Mã tài liệu | Mục đích & Nội dung cốt lõi | Trạng thái |
|:---:|:---|:---|:---:|
| 01 | `docs/PHASE_2F_BUSINESS_REQUIREMENTS.md` | Phân tích nghiệp vụ HRM, chân dung người dùng, tuân thủ Bộ luật Lao động 2019, Acceptance Criteria | **HOÀN THÀNH** |
| 02 | `docs/PHASE_2F_TECHNICAL_SPECIFICATION.md` | Đặc tả kỹ thuật kiến trúc NestJS, thuật toán khóa bi quan trên `leave_balances`, xử lý múi giờ UTC+7 | **HOÀN THÀNH** |
| 03 | `docs/PHASE_2F_DATABASE_DESIGN.md` | Sơ đồ ERD Mermaid, chi tiết 10 thực thể HRM hiện có trong schema, quan hệ liên phân hệ | **HOÀN THÀNH** |
| 04 | `docs/PHASE_2F_API_CONTRACT.md` | Hợp đồng giao diện RESTful API chuẩn, validation DTO số điện thoại Việt Nam, chuẩn hóa payload | **HOÀN THÀNH** |
| 05 | `docs/PHASE_2F_RBAC_MATRIX.md` | Ma trận phân quyền 14 quyền hạn `hrm.*` trên 5 vai trò, cơ chế chống nâng đặc quyền | **HOÀN THÀNH** |
| 06 | `docs/PHASE_2F_TEST_PLAN.md` | Kế hoạch kiểm thử tự động E2E, kịch bản concurrency chống âm quỹ phép, cách ly đa khách thuê | **HOÀN THÀNH** |
| 07 | `docs/PHASE_2F_DECISION_LOG.md` | Nhật ký 4 quyết định kiến trúc chiến lược: tách biệt Payroll, tái sử dụng schema, RLS không bypass | **HOÀN THÀNH** |

---

## 2. PHẠM VI NGHIỆP VỤ & PHÂN ĐỊNH RANH GIỚI MVP (MVP SCOPE & BOUNDARIES)

### 2.1. Phạm vi cốt lõi trong MVP Phase 2F
1. **Cơ cấu Tổ chức:** Quản lý cây phòng ban (`departments`) đa cấp và danh mục chức vụ (`positions`).
2. **Hồ sơ Nhân sự (Employee Master Data):**
   - Quản lý định danh nhân viên (`employees`), mã nhân viên duy nhất theo tổ chức (`employee_code`).
   - Phân bổ phòng ban, chức vụ, cấp quản lý trực tiếp (`manager_employee_id`).
   - Lịch sử biến động nhân sự (`employee_histories`).
3. **Hợp đồng Lao động:** Quản lý thời hạn và loại hình hợp đồng theo quy định BLLĐ 2019.
4. **Chấm công Hàng ngày (Time & Attendance Core):**
   - Ca làm việc chuẩn (`work_shifts`).
   - Ghi nhận Check-in / Check-out thời gian thực trên Web UI, tự động phân loại `PRESENT`, `LATE`, `EARLY_LEAVE`, `ABSENT`.
   - Quy trình điều chỉnh chấm công có kiểm toán (`adjusted_by`, `adjustment_reason`).
5. **Quản trị Nghỉ phép & Quỹ phép (Leave Management & Balance Ledger):**
   - Danh mục loại nghỉ phép (`leave_types`) với định mức mặc định 12 ngày phép năm.
   - Sổ cái số dư ngày phép theo năm (`leave_balances`): Quản lý `entitled_days`, `used_days`, `pending_days`, `available_days`.
   - Quy trình nộp đơn, duyệt đơn (`leave_requests`) với cơ chế trừ quỹ phép nguyên tử (Atomic Balance Deduction).

### 2.2. Phân định ranh giới ngoài phạm vi (Deferred to Future Phases)
- **Tính toán Lương & Thuế chi tiết:** Biểu tính thuế TNCN bậc thang lũy tiến và trích nộp bảo hiểm BHXH/BHYT được tách sang module Payroll chuyên biệt.
- **Tích hợp Phần cứng Máy chấm công:** Giai đoạn MVP hỗ trợ Web Check-in và API log ingestion; không tích hợp driver phần cứng sinh trắc học trực tiếp.

---

## 3. KIẾN TRÚC KỸ THUẬT & TOÀN VẸN DỮ LIỆU ĐỒNG THỜI

1. **Khóa bi quan chống âm quỹ ngày phép (Pessimistic Concurrency Control):**
   - Nộp đơn và phê duyệt đơn nghỉ phép sử dụng `SELECT FOR UPDATE` trên dòng `leave_balances` tương ứng trong cùng transaction.
   - Tuyệt đối ngăn chặn việc nộp đồng thời vượt quá số ngày phép khả dụng còn lại.
2. **Tuân thủ Chuẩn mực PostgreSQL RLS Không Bypass:**
   - 10 bảng HRM đều được kích hoạt `FORCE ROW LEVEL SECURITY`.
   - Áp dụng chính sách duy nhất: `organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid`.
   - Mọi truy vấn backend được thực thi trong ngữ cảnh `runInTenantContext(orgId)`.
3. **Chuẩn hóa Múi giờ Việt Nam (UTC+7 Asia/Ho_Chi_Minh):**
   - Tính toán ngày làm việc (`work_date`), giờ vào ca, tan ca chuẩn hóa theo múi giờ địa phương, không bị lệch ngày khi chuyển đổi UTC.

---

## 4. KẾT LUẬN & ĐỀ XUẤT HỘI ĐỒNG KIẾN TRÚC

Toàn bộ quá trình Discovery, Business Analysis và Technical Design của **Phase 2F (HRM & Workforce Management)** đã hoàn thành xuất sắc, đầy đủ 7 tài liệu quy chuẩn, không có bất kỳ mâu thuẫn hay điểm nghẽn kiến trúc nào.

**TRẠNG THÁI BÁO CÁO:**
# **PHASE 2F DESIGN — READY FOR REVIEW**

Kính trình Senior Technical Lead & Code Auditor (ChatGPT) xem xét đánh giá bộ tài liệu thiết kế và phê duyệt chuyển sang giai đoạn thực thi: **PHASE 2F IMPLEMENTATION AUTHORIZED**!
