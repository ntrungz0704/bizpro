# NHẬT KÝ QUYẾT ĐỊNH KIẾN TRÚC: PHASE 2F — HRM & WORKFORCE MANAGEMENT
**(PHASE 2F ARCHITECTURE & TECHNICAL DECISION LOG)**

**Mã tài liệu:** `docs/PHASE_2F_DECISION_LOG.md`  
**Dự án:** BizPro+ Modular Enterprise ERP & Business Management System  
**Ngày ban hành:** 06/11/2026  
**Chuyên gia thực hiện:** Principal Software Architect & Lead System Engineer  
**Kính gửi:** Senior Technical Lead & System Architecture Board (ChatGPT)  
**Trạng thái tài liệu:** **DESIGN ONLY — READY FOR REVIEW**  

---

## 1. QUYẾT ĐỊNH 2F-01: PHẠM VI TÁCH BIỆT HRM VÀ PAYROLL TRONG MVP

- **Bối cảnh:** Quản trị nhân sự thường liên quan đến tính lương, BHXH và thuế TNCN. Tuy nhiên, logic thuế TNCN tại Việt Nam (biểu lũy tiến 7 bậc) và quy định đóng bảo hiểm (mức trần lương cơ sở) rất phức tạp và thay đổi theo chính sách nhà nước.
- **Quyết định:** Tách biệt rõ ràng ranh giới phân hệ (Separation of Concerns).
  - Phase 2F chỉ tập trung vào: Hồ sơ Nhân viên, Cơ cấu Tổ chức, Hợp đồng Lao động, Chấm công, và Quản trị Nghỉ phép.
  - Tính lương chi tiết, thuế TNCN, và đóng bảo hiểm được tách thành một module Payroll riêng biệt trong lộ trình tương lai.
- **Hệ quả:** Giảm độ phức tạp, kiểm soát chất lượng MVP tốt hơn, tăng tốc độ hoàn thiện và nghiệm thu.

---

## 2. QUYẾT ĐỊNH 2F-02: TÁI SỬ DỤNG NGUYÊN VẸN DATABASE SCHEMA ĐÃ THIẾT KẾ

- **Bối cảnh:** Khảo sát file `backend/prisma/schema.prisma` cho thấy 10 thực thể HRM (`departments`, `positions`, `employees`, `employee_contracts`, `work_shifts`, `attendance_records`, `leave_types`, `leave_balances`, `leave_requests`, `employee_histories`) đã được định nghĩa đầy đủ, chuẩn hóa 3NF và tích hợp các quan hệ ngoại khóa từ Phase 1D.
- **Quyết định:** **Zero Schema Modification** đối với các bảng hiện có. Tận dụng 100% cấu trúc schema có sẵn, không bổ sung bảng thừa, không làm phân mảnh dữ liệu.
- **Hệ quả:** Rút ngắn thời gian migration, tránh rủi ro phá vỡ schema hiện tại của hệ thống.

---

## 3. QUYẾT ĐỊNH 2F-03: THUẬT TOÁN KHÓA BI QUAN (PESSIMISTIC LOCKING) CHO QUỸ PHÉP

- **Bối cảnh:** Khi nhiều yêu cầu nộp đơn hoặc phê duyệt nghỉ phép diễn ra đồng thời, có thể xảy ra xung đột dữ liệu dẫn đến số ngày phép khả dụng bị âm (Double-spending of leave quota).
- **Quyết định:** Áp dụng thuật toán khóa bi quan `SELECT FOR UPDATE` trên bảng `leave_balances` trong cùng transaction với việc tạo/duyệt đơn nghỉ phép.
- **Hệ quả:** Bảo đảm tính tuần tự (Serializability), ngăn chặn triệt để race conditions, bảo vệ toàn vẹn dữ liệu quỹ phép.

---

## 4. QUYẾT ĐỊNH 2F-04: ÁP DỤNG TIÊU CHUẨN RLS KHÔNG BYPASS TRÊN TOÀN BỘ 10 BẢNG HRM

- **Bối cảnh:** Sau thành công của đợt Remediation tại Phase 2E, việc loại bỏ nhánh bypass `app.is_system_context` đã trở thành tiêu chuẩn bất biến của hệ thống.
- **Quyết định:** Cả 10 bảng thuộc phân hệ HRM khi kích hoạt RLS sẽ chỉ áp dụng predicate nghiêm ngặt:
  `organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid`
  Tuyệt đối không có nhánh bypass hệ thống. Mọi truy cập backend phải chạy qua `runInTenantContext(orgId)`.
- **Hệ quả:** Đồng bộ 100% với kiến trúc bảo mật cấp doanh nghiệp, bảo đảm cách ly dữ liệu nhân viên tuyệt đối giữa các công ty khách thuê.
