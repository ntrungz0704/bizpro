# BÁO CÁO KIỂM THỬ TỰ ĐỘNG E2E: PHASE 2F — HRM & WORKFORCE MANAGEMENT
**(PHASE 2F END-TO-END AUTOMATED TEST REPORT)**

**Mã tài liệu:** `docs/PHASE_2F_E2E_TEST_REPORT.md`  
**Dự án:** BizPro+ Modular Enterprise ERP & Business Management System  
**Ngày ban hành:** 06/11/2026  
**Chuyên gia thực hiện:** Principal QA & Test Automation Architect  
**Kính gửi:** Senior Technical Lead & Code Auditor (ChatGPT)  
**Trạng thái:** **E2E TEST SUITE — 12/12 PASSED (100% GREEN)**

---

## 1. TỔNG KẾT KẾT QUẢ KIỂM THỬ E2E

- **Test Suite Path:** `backend/test/phase2f.e2e-spec.ts`
- **Thời gian thực thi:** 7.804 giây
- **Tổng số Test Cases:** 12/12 PASS (100%)
- **Số lỗi phát sinh:** 0
- **Số test bị bỏ qua:** 0

---

## 2. KẾT QUẢ CHI TIẾT TỪNG TEST CASE

| Test ID | Nội dung kiểm thử | Kết quả | Thời gian |
|:---:|:---|:---:|:---:|
| **TC-HRM-01** | Truy vấn dữ liệu master data đã seed (Phòng ban, Chức vụ, Ca làm việc, Loại nghỉ phép) | **PASS** | 82 ms |
| **TC-HRM-02** | Tạo nhân viên với SĐT Việt Nam hợp lệ (0987654321), chặn trùng lặp mã NV và sai định dạng SĐT | **PASS** | 438 ms |
| **TC-HRM-03** | Tự động khởi tạo quỹ ngày phép năm (12 ngày) cho nhân viên mới tiếp nhận | **PASS** | 2 ms |
| **TC-HRM-04** | Chấm công Check-in ca làm việc thành công, chặn Check-in 2 lần trong cùng một ngày | **PASS** | 70 ms |
| **TC-HRM-05** | Chấm công Check-out ca làm việc thành công, đối soát giờ về và chặn Check-out 2 lần | **PASS** | 73 ms |
| **TC-HRM-06** | HR Manager điều chỉnh bản ghi chấm công kèm lý do giải trình bắt buộc | **PASS** | 58 ms |
| **TC-HRM-07** | Truy vấn số dư ngày phép khả dụng, nộp đơn nghỉ phép chuyển trạng thái `PENDING` | **PASS** | 72 ms |
| **TC-HRM-08** | Chặn nộp đơn nghỉ phép khi số ngày xin nghỉ vượt quá hạn mức khả dụng | **PASS** | 11 ms |
| **TC-HRM-09** | Chặn tự phê duyệt phép (Anti-Self-Approval), Quản lý duyệt đơn chuyển `pending -> used` | **PASS** | 199 ms |
| **TC-HRM-10** | Hủy đơn nghỉ phép ở trạng thái chờ duyệt (Pending), hoàn trả đủ ngày phép về quỹ khả dụng | **PASS** | 157 ms |
| **TC-HRM-11** | Kiểm thử đồng thời (Concurrency): 10 request tranh chấp 1.0 ngày phép, đúng 1 request thành công | **PASS** | 601 ms |
| **TC-HRM-12** | Cách ly dữ liệu đa tổ chức (Multi-Tenant Isolation) & RLS: Org B không thể xem/sửa dữ liệu Org A | **PASS** | 36 ms |

---

## 3. BẰNG CHỨNG KIỂM THỬ TRANH CHẤP ĐỒNG THỜI (TC-HRM-11)

- **Kịch bản:** Nhân viên có chính xác 1.0 ngày phép.
- **Thực thi đồng thời:** 10 HTTP Request nộp đơn nghỉ phép đồng thời qua `Promise.allSettled`.
- **Kết quả:**
  - `successCount`: 1 (HTTP 201 Created)
  - `failedCount`: 9 (HTTP 400 Bad Request — `Số ngày phép khả dụng không đủ`)
- **Trạng thái DB sau kiểm thử:**
  - `pendingDays`: 1.0
  - `usedDays`: 0.0
  - `availableDays`: 0.0
  - **Số dư âm kho phép:** 0.0 (Tuyệt đối không bị âm quỹ phép).
