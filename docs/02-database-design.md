# DATABASE DESIGN SPECIFICATION (THIẾT KẾ CƠ SỞ DỮ LIỆU VẬT LÝ)
## BUSINESS MANAGEMENT SYSTEM (POSTGRESQL 16+)
**Phiên bản:** 1.0  
**Hệ quản trị CSDL:** PostgreSQL 16+  
**ORM sử dụng:** Prisma ORM  
**Chuẩn thiết kế:** 3NF, Tenant-Isolated, ACID Compliant, Audit-Ready  

---

## 1. NGUYÊN TẮC THIẾT KẾ CƠ SỞ DỮ LIỆU

1. **Khóa chính (Primary Key):** Sử dụng `UUID` (khuyến nghị UUIDv7 hoặc `gen_random_uuid()`) để tránh lộ số lượng bản ghi nội bộ, hỗ trợ phân tán và chống tấn công duyệt ID tuần tự (ID enumeration).
2. **Multi-tenancy:** Tất cả các bảng nghiệp vụ đều chứa cột `organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`.
3. **Tiền tệ & Số lượng (Numeric Precision):**
   - Tiền tệ (`amount`, `unit_price`, `total_amount`, `cost_price`): Dùng `NUMERIC(15, 2)` (Hỗ trợ số tiền tới hàng trăm tỷ đồng với 2 chữ số thập phân).
   - Số lượng kho (`quantity`, `quantity_on_hand`, `quantity_reserved`): Dùng `NUMERIC(12, 3)` (Hỗ trợ đơn vị tính lẻ như kg, mét, lít đến 3 chữ số thập phân).
   - Tỷ lệ thuế & Chiết khấu (`tax_rate`, `discount_percentage`): Dùng `NUMERIC(5, 2)`.
4. **Thời gian (Timestamps):** Thống nhất lưu kiểu `TIMESTAMPTZ` (UTC). Khi trả về client sẽ hiển thị theo `timezone` của Organization.
5. **Snapshotting:** Đơn hàng (`sales_order_items`) bắt buộc snapshot lại: `sku_snapshot`, `product_name_snapshot`, `unit_price`, `tax_rate` để bảo toàn dữ liệu lịch sử kế toán khi danh mục sản phẩm bị chỉnh sửa.
6. **Bất biến (Immutability):** Bảng `inventory_transactions` và `audit_logs` là Append-only, không cung cấp API cập nhật hay xóa dòng.
7. **Bảo toàn khóa ngoại:** Các quan hệ cha - con quan trọng sử dụng `ON DELETE RESTRICT` để chống xóa nhầm dữ liệu đang có ràng buộc nghiệp vụ (ví dụ: không thể xóa sản phẩm đã có lịch sử giao dịch kho hoặc đơn hàng).

---

## 2. DANH SÁCH ENUMS HỆ THỐNG

```sql
-- 1. Trạng thái chung
CREATE TYPE common_status AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- 2. CRM
CREATE TYPE lead_status AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED');
CREATE TYPE customer_type AS ENUM ('INDIVIDUAL', 'BUSINESS');
CREATE TYPE deal_status AS ENUM ('OPEN', 'WON', 'LOST');
CREATE TYPE activity_type AS ENUM ('CALL', 'MEETING', 'EMAIL', 'TASK', 'NOTE');
CREATE TYPE activity_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- 3. Kho & Tồn kho
CREATE TYPE stock_doc_status AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');
CREATE TYPE transfer_status AS ENUM ('DRAFT', 'IN_TRANSIT', 'POSTED', 'CANCELLED');
CREATE TYPE stocktake_status AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE inventory_transaction_type AS ENUM (
    'RECEIPT',          -- Nhập kho
    'ISSUE',            -- Xuất kho
    'TRANSFER_OUT',     -- Chuyển đi
    'TRANSFER_IN',      -- Chuyển đến
    'ADJUST_INCREASE',  -- Điều chỉnh tăng
    'ADJUST_DECREASE'   -- Điều chỉnh giảm
);
CREATE TYPE reservation_status AS ENUM ('ACTIVE', 'FULFILLED', 'RELEASED');

-- 4. Bán hàng
CREATE TYPE sales_order_status AS ENUM (
    'DRAFT',
    'CONFIRMED',
    'PARTIALLY_FULFILLED',
    'FULFILLED',
    'CANCELLED',
    'ON_HOLD'
);

-- 5. Nhân sự (HRM)
CREATE TYPE employment_status AS ENUM ('PROBATION', 'OFFICIAL', 'ON_LEAVE', 'RESIGNED', 'TERMINATED');
CREATE TYPE contract_type AS ENUM ('PROBATION', 'DEFINITE_TERM', 'INDEFINITE_TERM', 'PART_TIME', 'INTERNSHIP');
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'LATE', 'EARLY_LEAVE', 'ABSENT', 'HOLIDAY', 'ON_LEAVE');
CREATE TYPE attendance_source AS ENUM ('WEB_UI', 'MANUAL_ENTRY', 'BIOMETRIC_DEVICE', 'MOBILE_APP');
CREATE TYPE leave_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- 6. Hệ thống & Phân quyền
CREATE TYPE data_scope AS ENUM ('OWN', 'DEPARTMENT', 'ALL');
CREATE TYPE notification_type AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'TASK_ASSIGNED', 'APPROVAL_REQUIRED');
```

---

## 3. TỪ ĐIỂN DỮ LIỆU CHI TIẾT (PHYSICAL DATA DICTIONARY)

### NHÓM 1: SHARED PLATFORM & PHÂN QUYỀN

#### 1. Bảng `organizations` (Thông tin Tổ chức/Doanh nghiệp)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên doanh nghiệp/công ty |
| `code` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Mã tổ chức (dùng định danh) |
| `tax_code` | `VARCHAR(50)` | `NULLABLE` | Mã số thuế |
| `email` | `VARCHAR(255)` | `NOT NULL` | Email liên hệ chính |
| `phone` | `VARCHAR(50)` | `NULLABLE` | Số điện thoại |
| `address` | `TEXT` | `NULLABLE` | Địa chỉ trụ sở |
| `logo_url` | `TEXT` | `NULLABLE` | URL ảnh đại diện logo |
| `timezone` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'Asia/Ho_Chi_Minh'` | Múi giờ hoạt động |
| `currency` | `VARCHAR(10)` | `NOT NULL, DEFAULT 'VND'` | Đơn vị tiền tệ chính |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái hoạt động |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |

#### 2. Bảng `users` (Tài khoản người dùng đăng nhập)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `employee_id` | `UUID` | `NULLABLE, UNIQUE, FK -> employees(id)` | Liên kết hồ sơ nhân viên |
| `full_name` | `VARCHAR(255)` | `NOT NULL` | Họ và tên hiển thị |
| `email` | `VARCHAR(255)` | `NOT NULL` | Email đăng nhập |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Mật khẩu băm (Argon2id/Bcrypt) |
| `phone` | `VARCHAR(50)` | `NULLABLE` | Số điện thoại |
| `avatar_url` | `TEXT` | `NULLABLE` | Ảnh đại diện |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái tài khoản |
| `last_login_at` | `TIMESTAMPTZ` | `NULLABLE` | Lần đăng nhập cuối |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, email)`

#### 3. Bảng `roles` (Vai trò)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `name` | `VARCHAR(100)` | `NOT NULL` | Tên vai trò (Admin, Trưởng phòng kinh doanh, v.v.) |
| `code` | `VARCHAR(50)` | `NOT NULL` | Mã vai trò |
| `description` | `TEXT` | `NULLABLE` | Mô tả trách nhiệm |
| `is_system` | `BOOLEAN` | `NOT NULL, DEFAULT false` | Role mặc định của hệ thống (không thể xóa) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, code)`

#### 4. Bảng `permissions` (Danh mục quyền năng chuẩn)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `code` | `VARCHAR(100)` | `NOT NULL, UNIQUE` | Mã quyền (`crm.leads.create`, `sales.orders.confirm`...) |
| `module` | `VARCHAR(50)` | `NOT NULL` | Tên module (CRM, INVENTORY, HRM, SALES, SYSTEM) |
| `action` | `VARCHAR(50)` | `NOT NULL` | Hành động (READ, CREATE, UPDATE, DELETE, APPROVE, POST) |
| `description` | `TEXT` | `NOT NULL` | Giải thích ý nghĩa quyền |

#### 5. Bảng `role_permissions` (Gán quyền cho vai trò kèm phạm vi dữ liệu)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `role_id` | `UUID` | `NOT NULL, FK -> roles(id) ON DELETE CASCADE` | Vai trò |
| `permission_id` | `UUID` | `NOT NULL, FK -> permissions(id) ON DELETE CASCADE` | Quyền |
| `scope` | `data_scope` | `NOT NULL, DEFAULT 'ALL'` | Phạm vi: OWN, DEPARTMENT, ALL |
*Primary Key:* `PRIMARY KEY (role_id, permission_id)`

#### 6. Bảng `user_roles` (Gán vai trò cho người dùng)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `user_id` | `UUID` | `NOT NULL, FK -> users(id) ON DELETE CASCADE` | Người dùng |
| `role_id` | `UUID` | `NOT NULL, FK -> roles(id) ON DELETE CASCADE` | Vai trò |
*Primary Key:* `PRIMARY KEY (user_id, role_id)`

#### 7. Bảng `audit_logs` (Nhật ký kiểm toán truy vết)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `user_id` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE SET NULL` | Người thực hiện (null nếu do hệ thống) |
| `module` | `VARCHAR(50)` | `NOT NULL` | Module phát sinh thao tác |
| `action` | `VARCHAR(50)` | `NOT NULL` | Hành động (CREATE, UPDATE, DELETE, POST, APPROVE) |
| `entity_type` | `VARCHAR(100)` | `NOT NULL` | Tên bảng/thực thể (SalesOrder, Product...) |
| `entity_id` | `VARCHAR(100)` | `NOT NULL` | ID của bản ghi bị tác động |
| `old_values` | `JSONB` | `NULLABLE` | Giá trị trước khi sửa |
| `new_values` | `JSONB` | `NULLABLE` | Giá trị sau khi sửa |
| `ip_address` | `VARCHAR(50)` | `NULLABLE` | IP mạng |
| `user_agent` | `TEXT` | `NULLABLE` | Trình duyệt / Device |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời điểm ghi nhận |

#### 8. Bảng `notifications` (Thông báo người dùng)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `user_id` | `UUID` | `NOT NULL, FK -> users(id) ON DELETE CASCADE` | Người nhận thông báo |
| `type` | `notification_type` | `NOT NULL, DEFAULT 'INFO'` | Phân loại thông báo |
| `title` | `VARCHAR(255)` | `NOT NULL` | Tiêu đề thông báo |
| `message` | `TEXT` | `NOT NULL` | Nội dung chi tiết |
| `reference_type`| `VARCHAR(100)` | `NULLABLE` | Loại đối tượng liên kết (LeaveRequest, SalesOrder...) |
| `reference_id` | `VARCHAR(100)` | `NULLABLE` | ID đối tượng liên kết |
| `is_read` | `BOOLEAN` | `NOT NULL, DEFAULT false` | Đã đọc hay chưa |
| `read_at` | `TIMESTAMPTZ` | `NULLABLE` | Thời điểm đọc |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời điểm tạo |

#### 9. Bảng `files` (Quản lý file đính kèm tập trung)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `uploaded_by` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE SET NULL` | Người tải lên |
| `file_name` | `VARCHAR(255)` | `NOT NULL` | Tên gốc của file |
| `storage_key` | `TEXT` | `NOT NULL` | Đường dẫn lưu trữ trên S3/MinIO |
| `mime_type` | `VARCHAR(100)` | `NOT NULL` | Định dạng tệp tin |
| `file_size` | `BIGINT` | `NOT NULL` | Dung lượng byte |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời điểm tải lên |

---

### NHÓM 2: QUẢN LÝ NHÂN SỰ (HRM)

#### 10. Bảng `departments` (Phòng ban/Bộ phận)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên phòng ban |
| `code` | `VARCHAR(50)` | `NOT NULL` | Mã phòng ban |
| `parent_department_id` | `UUID` | `NULLABLE, FK -> departments(id) ON DELETE SET NULL` | Phòng ban cấp trên (cây phân cấp) |
| `manager_employee_id` | `UUID` | `NULLABLE` | ID nhân viên trưởng phòng (FK được tạo sau) |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái hoạt động |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, code)`

#### 11. Bảng `positions` (Chức vụ/Vị trí công việc)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên chức vụ (Giám đốc, Nhân viên kho, v.v.) |
| `code` | `VARCHAR(50)` | `NOT NULL` | Mã chức vụ |
| `description` | `TEXT` | `NULLABLE` | Mô tả công việc |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, code)`

#### 12. Bảng `employees` (Hồ sơ Nhân viên)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `employee_code` | `VARCHAR(50)` | `NOT NULL` | Mã nhân viên (NV0001...) |
| `full_name` | `VARCHAR(255)` | `NOT NULL` | Họ và tên |
| `email` | `VARCHAR(255)` | `NOT NULL` | Email cá nhân/công việc |
| `phone` | `VARCHAR(50)` | `NULLABLE` | Điện thoại liên hệ |
| `date_of_birth` | `DATE` | `NULLABLE` | Ngày sinh |
| `gender` | `VARCHAR(20)` | `NULLABLE` | Giới tính |
| `address` | `TEXT` | `NULLABLE` | Địa chỉ thường trú |
| `department_id` | `UUID` | `NULLABLE, FK -> departments(id) ON DELETE RESTRICT` | Trực thuộc phòng ban |
| `position_id` | `UUID` | `NULLABLE, FK -> positions(id) ON DELETE RESTRICT` | Đảm nhiệm chức vụ |
| `manager_employee_id` | `UUID` | `NULLABLE, FK -> employees(id) ON DELETE SET NULL` | Quản lý trực tiếp |
| `hire_date` | `DATE` | `NOT NULL` | Ngày bắt đầu làm việc |
| `employment_status` | `employment_status` | `NOT NULL, DEFAULT 'OFFICIAL'` | Tình trạng lao động |
| `user_id` | `UUID` | `NULLABLE, UNIQUE, FK -> users(id) ON DELETE SET NULL` | Tài khoản đăng nhập hệ thống nếu có |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, employee_code)`

#### 13. Bảng `employee_contracts` (Hợp đồng lao động cơ bản)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `employee_id` | `UUID` | `NOT NULL, FK -> employees(id) ON DELETE CASCADE` | Nhân viên ký hợp đồng |
| `contract_number` | `VARCHAR(100)` | `NOT NULL` | Số hợp đồng |
| `contract_type` | `contract_type` | `NOT NULL` | Loại hợp đồng (Thử việc, 1 năm, không xác định...) |
| `start_date` | `DATE` | `NOT NULL` | Ngày có hiệu lực |
| `end_date` | `DATE` | `NULLABLE` | Ngày hết hạn |
| `salary_amount` | `NUMERIC(15, 2)`| `NULLABLE` | Mức lương cơ bản thỏa thuận |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái hiệu lực |
| `file_id` | `UUID` | `NULLABLE, FK -> files(id) ON DELETE SET NULL` | File PDF scan hợp đồng |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, contract_number)`

#### 14. Bảng `work_shifts` (Ca làm việc)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `name` | `VARCHAR(100)` | `NOT NULL` | Tên ca (Ca hành chính, Ca sáng...) |
| `code` | `VARCHAR(50)` | `NOT NULL` | Mã ca |
| `start_time` | `TIME` | `NOT NULL` | Giờ bắt đầu (08:00:00) |
| `end_time` | `TIME` | `NOT NULL` | Giờ kết thúc (17:30:00) |
| `break_duration_minutes` | `INT` | `NOT NULL, DEFAULT 60` | Thời gian nghỉ giữa ca (phút) |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, code)`

#### 15. Bảng `attendance_records` (Ghi nhận chấm công hàng ngày)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `employee_id` | `UUID` | `NOT NULL, FK -> employees(id) ON DELETE RESTRICT` | Nhân viên chấm công |
| `shift_id` | `UUID` | `NULLABLE, FK -> work_shifts(id) ON DELETE SET NULL` | Thuộc ca làm việc nào |
| `work_date` | `DATE` | `NOT NULL` | Ngày làm việc |
| `check_in_at` | `TIMESTAMPTZ` | `NULLABLE` | Giờ check-in thực tế |
| `check_out_at` | `TIMESTAMPTZ` | `NULLABLE` | Giờ check-out thực tế |
| `source` | `attendance_source` | `NOT NULL, DEFAULT 'WEB_UI'` | Nguồn chấm công |
| `status` | `attendance_status` | `NOT NULL, DEFAULT 'PRESENT'` | Tình trạng (Đúng giờ, Đi muộn, Vắng mặt...) |
| `adjusted_by` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE SET NULL` | Người điều chỉnh dữ liệu |
| `adjustment_reason` | `TEXT` | `NULLABLE` | Lý do điều chỉnh công |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, employee_id, work_date)`

#### 16. Bảng `leave_types` (Loại ngày nghỉ phép)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `name` | `VARCHAR(100)` | `NOT NULL` | Tên loại phép (Nghỉ phép năm, Nghỉ ốm, Nghỉ thai sản...) |
| `code` | `VARCHAR(50)` | `NOT NULL` | Mã loại phép |
| `annual_quota` | `NUMERIC(5, 1)` | `NOT NULL, DEFAULT 12.0` | Hạn mức ngày nghỉ mặc định trong năm |
| `is_paid` | `BOOLEAN` | `NOT NULL, DEFAULT true` | Có hưởng lương hay không |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, code)`

#### 17. Bảng `leave_balances` (Số dư ngày phép theo năm của nhân viên)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `employee_id` | `UUID` | `NOT NULL, FK -> employees(id) ON DELETE CASCADE` | Nhân viên sở hữu |
| `leave_type_id` | `UUID` | `NOT NULL, FK -> leave_types(id) ON DELETE RESTRICT`| Loại phép |
| `year` | `INT` | `NOT NULL` | Năm áp dụng (2026, 2027...) |
| `entitled_days` | `NUMERIC(5, 1)` | `NOT NULL, DEFAULT 0.0` | Tổng số ngày phép được hưởng |
| `used_days` | `NUMERIC(5, 1)` | `NOT NULL, DEFAULT 0.0` | Số ngày đã sử dụng thực tế |
| `pending_days` | `NUMERIC(5, 1)` | `NOT NULL, DEFAULT 0.0` | Số ngày đang chờ cấp trên duyệt |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, employee_id, leave_type_id, year)`

#### 18. Bảng `leave_requests` (Đơn xin nghỉ phép)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `employee_id` | `UUID` | `NOT NULL, FK -> employees(id) ON DELETE CASCADE` | Người nộp đơn |
| `leave_type_id` | `UUID` | `NOT NULL, FK -> leave_types(id) ON DELETE RESTRICT`| Loại ngày phép |
| `start_date` | `DATE` | `NOT NULL` | Ngày bắt đầu nghỉ |
| `end_date` | `DATE` | `NOT NULL` | Ngày kết thúc nghỉ |
| `total_days` | `NUMERIC(5, 1)` | `NOT NULL` | Tổng số ngày xin nghỉ |
| `reason` | `TEXT` | `NOT NULL` | Lý do xin nghỉ |
| `status` | `leave_request_status` | `NOT NULL, DEFAULT 'PENDING'` | Trạng thái phê duyệt |
| `approver_employee_id` | `UUID` | `NULLABLE, FK -> employees(id) ON DELETE SET NULL` | Người có quyền duyệt |
| `approved_at` | `TIMESTAMPTZ` | `NULLABLE` | Thời điểm phê duyệt/từ chối |
| `rejection_reason` | `TEXT` | `NULLABLE` | Lý do từ chối nếu có |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo đơn |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |

#### 19. Bảng `employee_histories` (Lịch sử biến động nhân sự)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `employee_id` | `UUID` | `NOT NULL, FK -> employees(id) ON DELETE CASCADE` | Nhân viên |
| `change_type` | `VARCHAR(50)` | `NOT NULL` | DEPARTMENT_TRANSFER, PROMOTION, STATUS_CHANGE... |
| `old_value` | `TEXT` | `NULLABLE` | Giá trị cũ |
| `new_value` | `TEXT` | `NOT NULL` | Giá trị mới |
| `effective_date` | `DATE` | `NOT NULL` | Ngày có hiệu lực |
| `changed_by` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE SET NULL` | Người thực hiện cập nhật |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời điểm lưu lịch sử |

---

### NHÓM 3: CRM (KHÁCH HÀNG & CƠ HỘI KINH DOANH)

#### 20. Bảng `companies` (Doanh nghiệp/Khách hàng tổ chức)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên công ty đối tác |
| `code` | `VARCHAR(50)` | `NOT NULL` | Mã doanh nghiệp |
| `tax_code` | `VARCHAR(50)` | `NULLABLE` | Mã số thuế |
| `industry` | `VARCHAR(100)` | `NULLABLE` | Ngành nghề hoạt động |
| `website` | `VARCHAR(255)` | `NULLABLE` | Website |
| `email` | `VARCHAR(255)` | `NULLABLE` | Email công ty |
| `phone` | `VARCHAR(50)` | `NULLABLE` | Số điện thoại |
| `address` | `TEXT` | `NULLABLE` | Địa chỉ |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, code)`

#### 21. Bảng `contacts` (Người liên hệ đại diện)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `company_id` | `UUID` | `NULLABLE, FK -> companies(id) ON DELETE SET NULL` | Thuộc công ty đối tác nào |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | Tên |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | Họ và tên đệm |
| `email` | `VARCHAR(255)` | `NULLABLE` | Email cá nhân |
| `phone` | `VARCHAR(50)` | `NULLABLE` | Số điện thoại di động |
| `job_title` | `VARCHAR(100)` | `NULLABLE` | Chức vụ trong đối tác |
| `notes` | `TEXT` | `NULLABLE` | Ghi chú cá nhân hóa |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |

#### 22. Bảng `leads` (Khách hàng tiềm năng)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `company_name` | `VARCHAR(255)` | `NULLABLE` | Tên đơn vị tiềm năng |
| `contact_name` | `VARCHAR(255)` | `NOT NULL` | Tên người liên hệ |
| `email` | `VARCHAR(255)` | `NULLABLE` | Email |
| `phone` | `VARCHAR(50)` | `NULLABLE` | Điện thoại |
| `source` | `VARCHAR(100)` | `NULLABLE` | Nguồn (Facebook, Google Ads, Giới thiệu...) |
| `status` | `lead_status` | `NOT NULL, DEFAULT 'NEW'` | Trạng thái lead |
| `assigned_to` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE SET NULL` | Nhân viên kinh doanh phụ trách |
| `converted_company_id` | `UUID` | `NULLABLE, FK -> companies(id)` | Liên kết sau chuyển đổi |
| `converted_contact_id` | `UUID` | `NULLABLE, FK -> contacts(id)` | Liên kết sau chuyển đổi |
| `converted_customer_id`| `UUID` | `NULLABLE, FK -> customers(id)` | Liên kết khách hàng chính thức |
| `converted_at` | `TIMESTAMPTZ` | `NULLABLE` | Thời điểm chuyển đổi thành công |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |

#### 23. Bảng `customers` (Khách hàng chính thức)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `company_id` | `UUID` | `NULLABLE, FK -> companies(id) ON DELETE SET NULL` | Nếu là khách hàng doanh nghiệp |
| `customer_code` | `VARCHAR(50)` | `NOT NULL` | Mã khách hàng (KH0001...) |
| `customer_type` | `customer_type` | `NOT NULL, DEFAULT 'BUSINESS'` | Cá nhân hay Doanh nghiệp |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên khách hàng hiển thị |
| `email` | `VARCHAR(255)` | `NULLABLE` | Email chính |
| `phone` | `VARCHAR(50)` | `NULLABLE` | Điện thoại |
| `address` | `TEXT` | `NULLABLE` | Địa chỉ thanh toán/giao hàng |
| `tax_code` | `VARCHAR(50)` | `NULLABLE` | Mã số thuế |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, customer_code)`

#### 24. Bảng `pipelines` (Quy trình bán hàng)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `name` | `VARCHAR(100)` | `NOT NULL` | Tên Pipeline (Tiêu chuẩn B2B, Bán lẻ buôn...) |
| `code` | `VARCHAR(50)` | `NOT NULL` | Mã pipeline |
| `is_default` | `BOOLEAN` | `NOT NULL, DEFAULT false` | Pipeline mặc định |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, code)`

#### 25. Bảng `pipeline_stages` (Giai đoạn trong Pipeline)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `pipeline_id` | `UUID` | `NOT NULL, FK -> pipelines(id) ON DELETE CASCADE`| Thuộc pipeline |
| `name` | `VARCHAR(100)` | `NOT NULL` | Tên giai đoạn (New, Qualified, Proposal...) |
| `code` | `VARCHAR(50)` | `NOT NULL` | Mã giai đoạn |
| `position` | `INT` | `NOT NULL, DEFAULT 0` | Thứ tự hiển thị trên Kanban |
| `probability` | `INT` | `NOT NULL, DEFAULT 0` | Xác suất thành công (0-100%) |
| `is_won` | `BOOLEAN` | `NOT NULL, DEFAULT false` | Đánh dấu là giai đoạn chốt thành công |
| `is_lost` | `BOOLEAN` | `NOT NULL, DEFAULT false` | Đánh dấu là giai đoạn chốt thất bại |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(pipeline_id, code)`

#### 26. Bảng `deals` (Cơ hội kinh doanh)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `pipeline_id` | `UUID` | `NOT NULL, FK -> pipelines(id) ON DELETE RESTRICT`| Đang ở quy trình bán hàng nào |
| `stage_id` | `UUID` | `NOT NULL, FK -> pipeline_stages(id) ON DELETE RESTRICT` | Đang ở bước nào |
| `customer_id` | `UUID` | `NULLABLE, FK -> customers(id) ON DELETE RESTRICT` | Khách hàng mục tiêu |
| `contact_id` | `UUID` | `NULLABLE, FK -> contacts(id) ON DELETE SET NULL` | Người trực tiếp đàm phán |
| `lead_id` | `UUID` | `NULLABLE, FK -> leads(id) ON DELETE SET NULL` | Nguồn gốc từ Lead nếu có |
| `title` | `VARCHAR(255)` | `NOT NULL` | Tên cơ hội |
| `amount` | `NUMERIC(15, 2)`| `NOT NULL, DEFAULT 0.00` | Giá trị dự kiến |
| `currency` | `VARCHAR(10)` | `NOT NULL, DEFAULT 'VND'` | Tiền tệ |
| `expected_close_date` | `DATE` | `NULLABLE` | Ngày dự kiến chốt |
| `assigned_to` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE SET NULL` | Nhân viên kinh doanh phụ trách |
| `status` | `deal_status` | `NOT NULL, DEFAULT 'OPEN'` | OPEN, WON, LOST |
| `lost_reason` | `TEXT` | `NULLABLE` | Lý do thất bại |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |

#### 27. Bảng `deal_stage_histories` (Lịch sử dịch chuyển giai đoạn Deal)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `deal_id` | `UUID` | `NOT NULL, FK -> deals(id) ON DELETE CASCADE` | Thuộc Deal |
| `from_stage_id` | `UUID` | `NULLABLE, FK -> pipeline_stages(id)` | Bước trước |
| `to_stage_id` | `UUID` | `NOT NULL, FK -> pipeline_stages(id)` | Bước chuyển tới |
| `changed_by` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE SET NULL` | Người kéo thả/chuyển bước |
| `changed_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời điểm đổi bước |

#### 28. Bảng `activities` (Hoạt động tương tác chăm sóc)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `type` | `activity_type` | `NOT NULL, DEFAULT 'CALL'` | Loại hoạt động |
| `subject` | `VARCHAR(255)` | `NOT NULL` | Tiêu đề công việc |
| `description` | `TEXT` | `NULLABLE` | Chi tiết nội dung trao đổi |
| `due_at` | `TIMESTAMPTZ` | `NULLABLE` | Hạn hoàn thành |
| `completed_at` | `TIMESTAMPTZ` | `NULLABLE` | Thời điểm hoàn thành |
| `owner_user_id` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE SET NULL` | Người được giao việc |
| `related_entity_type` | `VARCHAR(50)` | `NOT NULL` | Deal, Lead, Customer... |
| `related_entity_id` | `VARCHAR(100)` | `NOT NULL` | ID đối tượng liên kết |
| `status` | `activity_status` | `NOT NULL, DEFAULT 'PENDING'` | Trạng thái |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |

#### 29. Bảng `crm_notes` (Ghi chú nhanh)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `content` | `TEXT` | `NOT NULL` | Nội dung ghi chú |
| `created_by` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE SET NULL` | Người viết |
| `related_entity_type` | `VARCHAR(50)` | `NOT NULL` | Deal, Lead, Customer... |
| `related_entity_id` | `VARCHAR(100)` | `NOT NULL` | ID đối tượng |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |

---

### NHÓM 4: INVENTORY (KHO & BIẾN ĐỘNG TỒN KHO)

#### 30. Bảng `product_categories` (Danh mục sản phẩm)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `parent_id` | `UUID` | `NULLABLE, FK -> product_categories(id) ON DELETE SET NULL` | Danh mục cha (cây danh mục) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên danh mục |
| `code` | `VARCHAR(50)` | `NOT NULL` | Mã danh mục |
| `description` | `TEXT` | `NULLABLE` | Mô tả |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, code)`

#### 31. Bảng `units_of_measure` (Đơn vị tính)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `name` | `VARCHAR(50)` | `NOT NULL` | Tên đơn vị (Cái, Hộp, Thùng, Kg, Mét...) |
| `symbol` | `VARCHAR(20)` | `NOT NULL` | Ký hiệu viết tắt (cái, box, kg...) |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, name)`

#### 32. Bảng `products` (Danh mục hàng hóa/Sản phẩm)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `category_id` | `UUID` | `NOT NULL, FK -> product_categories(id) ON DELETE RESTRICT`| Danh mục sản phẩm |
| `unit_id` | `UUID` | `NOT NULL, FK -> units_of_measure(id) ON DELETE RESTRICT` | Đơn vị tính cơ sở |
| `sku` | `VARCHAR(100)` | `NOT NULL` | Mã SKU sản phẩm |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên sản phẩm |
| `description` | `TEXT` | `NULLABLE` | Mô tả chi tiết |
| `barcode` | `VARCHAR(100)` | `NULLABLE` | Mã vạch (EAN-13, UPC...) |
| `cost_price` | `NUMERIC(15, 2)`| `NOT NULL, DEFAULT 0.00` | Giá vốn định mức / bình quân |
| `selling_price` | `NUMERIC(15, 2)`| `NOT NULL, DEFAULT 0.00` | Giá bán niêm yết |
| `min_stock_level`| `NUMERIC(12, 3)`| `NOT NULL, DEFAULT 0.000` | Ngưỡng cảnh báo tồn kho tối thiểu |
| `track_inventory`| `BOOLEAN` | `NOT NULL, DEFAULT true` | Có theo dõi tồn kho không (dịch vụ thì false) |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái kinh doanh |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, sku)`

#### 33. Bảng `warehouses` (Danh sách kho hàng)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `code` | `VARCHAR(50)` | `NOT NULL` | Mã kho (KHO-HN, KHO-HCM...) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên kho hàng |
| `address` | `TEXT` | `NULLABLE` | Địa chỉ vật lý |
| `manager_employee_id` | `UUID` | `NULLABLE, FK -> employees(id) ON DELETE SET NULL` | Thủ kho phụ trách |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái hoạt động |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, code)`

#### 34. Bảng `inventory_balances` (Số dư tồn kho hiện tại)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `warehouse_id` | `UUID` | `NOT NULL, FK -> warehouses(id) ON DELETE RESTRICT`| Tại kho nào |
| `product_id` | `UUID` | `NOT NULL, FK -> products(id) ON DELETE RESTRICT` | Sản phẩm nào |
| `quantity_on_hand` | `NUMERIC(12, 3)`| `NOT NULL, DEFAULT 0.000` | Số lượng tồn thực tế |
| `quantity_reserved`| `NUMERIC(12, 3)`| `NOT NULL, DEFAULT 0.000` | Số lượng đã giữ cho đơn bán |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời điểm biến động gần nhất |
*Unique constraint:* `UNIQUE(organization_id, warehouse_id, product_id)`  
*Check constraint:* `CHECK (quantity_on_hand >= 0 AND quantity_reserved >= 0)`

#### 35. Bảng `suppliers` (Nhà cung cấp)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `code` | `VARCHAR(50)` | `NOT NULL` | Mã nhà cung cấp (NCC001...) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Tên nhà cung cấp |
| `contact_name` | `VARCHAR(255)` | `NULLABLE` | Người liên hệ |
| `email` | `VARCHAR(255)` | `NULLABLE` | Email |
| `phone` | `VARCHAR(50)` | `NULLABLE` | Số điện thoại |
| `address` | `TEXT` | `NULLABLE` | Địa chỉ |
| `tax_code` | `VARCHAR(50)` | `NULLABLE` | Mã số thuế |
| `status` | `common_status` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, code)`

#### 36. Bảng `stock_receipts` (Phiếu nhập kho)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `receipt_code` | `VARCHAR(50)` | `NOT NULL` | Mã phiếu nhập (PN0001...) |
| `warehouse_id` | `UUID` | `NOT NULL, FK -> warehouses(id) ON DELETE RESTRICT`| Nhập vào kho nào |
| `supplier_id` | `UUID` | `NULLABLE, FK -> suppliers(id) ON DELETE RESTRICT` | Nhập từ nhà cung cấp nào |
| `status` | `stock_doc_status`| `NOT NULL, DEFAULT 'DRAFT'` | DRAFT, POSTED, CANCELLED |
| `reference_number` | `VARCHAR(100)` | `NULLABLE` | Số hóa đơn / phiếu giao hàng NCC |
| `note` | `TEXT` | `NULLABLE` | Ghi chú nhập hàng |
| `received_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Ngày nhập kho |
| `created_by` | `UUID` | `NOT NULL, FK -> users(id) ON DELETE RESTRICT` | Nhân viên lập phiếu |
| `posted_by` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE RESTRICT` | Thủ kho xác nhận ghi sổ |
| `posted_at` | `TIMESTAMPTZ` | `NULLABLE` | Thời điểm ghi sổ chính thức |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, receipt_code)`

#### 37. Bảng `stock_receipt_items` (Chi tiết phiếu nhập kho)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `receipt_id` | `UUID` | `NOT NULL, FK -> stock_receipts(id) ON DELETE CASCADE`| Thuộc phiếu nhập |
| `product_id` | `UUID` | `NOT NULL, FK -> products(id) ON DELETE RESTRICT` | Sản phẩm |
| `quantity` | `NUMERIC(12, 3)`| `NOT NULL` | Số lượng nhập |
| `unit_cost` | `NUMERIC(15, 2)`| `NOT NULL, DEFAULT 0.00` | Giá vốn nhập 1 đơn vị |
| `line_total` | `NUMERIC(15, 2)`| `NOT NULL, DEFAULT 0.00` | Tổng giá trị dòng = quantity * unit_cost |

#### 38. Bảng `stock_issues` (Phiếu xuất kho)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `issue_code` | `VARCHAR(50)` | `NOT NULL` | Mã phiếu xuất (PX0001...) |
| `warehouse_id` | `UUID` | `NOT NULL, FK -> warehouses(id) ON DELETE RESTRICT`| Xuất từ kho nào |
| `reference_type`| `VARCHAR(50)` | `NOT NULL` | SALES_ORDER, MANUAL_ISSUE, DAMAGE... |
| `reference_id` | `VARCHAR(100)` | `NULLABLE` | ID đối tượng liên kết (ví dụ order_id) |
| `status` | `stock_doc_status`| `NOT NULL, DEFAULT 'DRAFT'` | DRAFT, POSTED, CANCELLED |
| `note` | `TEXT` | `NULLABLE` | Lý do xuất |
| `issued_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Ngày xuất kho |
| `created_by` | `UUID` | `NOT NULL, FK -> users(id) ON DELETE RESTRICT` | Người lập phiếu |
| `posted_by` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE RESTRICT` | Thủ kho xác nhận xuất sổ |
| `posted_at` | `TIMESTAMPTZ` | `NULLABLE` | Thời điểm xuất sổ |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, issue_code)`

#### 39. Bảng `stock_issue_items` (Chi tiết phiếu xuất kho)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `issue_id` | `UUID` | `NOT NULL, FK -> stock_issues(id) ON DELETE CASCADE`| Thuộc phiếu xuất |
| `product_id` | `UUID` | `NOT NULL, FK -> products(id) ON DELETE RESTRICT` | Sản phẩm |
| `quantity` | `NUMERIC(12, 3)`| `NOT NULL` | Số lượng xuất |
| `unit_cost` | `NUMERIC(15, 2)`| `NOT NULL, DEFAULT 0.00` | Giá vốn tại thời điểm xuất |

#### 40. Bảng `stock_transfers` (Phiếu chuyển kho nội bộ)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `transfer_code` | `VARCHAR(50)` | `NOT NULL` | Mã phiếu chuyển (CK0001...) |
| `source_warehouse_id` | `UUID` | `NOT NULL, FK -> warehouses(id) ON DELETE RESTRICT`| Kho xuất đi |
| `destination_warehouse_id` | `UUID` | `NOT NULL, FK -> warehouses(id) ON DELETE RESTRICT`| Kho nhận đến |
| `status` | `transfer_status` | `NOT NULL, DEFAULT 'DRAFT'` | DRAFT, IN_TRANSIT, POSTED, CANCELLED |
| `note` | `TEXT` | `NULLABLE` | Ghi chú chuyển hàng |
| `requested_by` | `UUID` | `NOT NULL, FK -> users(id) ON DELETE RESTRICT` | Người đề nghị |
| `posted_by` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE RESTRICT` | Người duyệt hoàn tất |
| `posted_at` | `TIMESTAMPTZ` | `NULLABLE` | Thời điểm hoàn tất nhập kho đích |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, transfer_code)`  
*Check constraint:* `CHECK (source_warehouse_id <> destination_warehouse_id)`

#### 41. Bảng `stock_transfer_items` (Chi tiết phiếu chuyển kho)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `transfer_id` | `UUID` | `NOT NULL, FK -> stock_transfers(id) ON DELETE CASCADE`| Thuộc phiếu chuyển |
| `product_id` | `UUID` | `NOT NULL, FK -> products(id) ON DELETE RESTRICT` | Sản phẩm chuyển |
| `quantity` | `NUMERIC(12, 3)`| `NOT NULL` | Số lượng chuyển |

#### 42. Bảng `stock_adjustments` (Phiếu điều chỉnh tồn kho)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `adjustment_code`| `VARCHAR(50)` | `NOT NULL` | Mã phiếu điều chỉnh (DC0001...) |
| `warehouse_id` | `UUID` | `NOT NULL, FK -> warehouses(id) ON DELETE RESTRICT`| Kho điều chỉnh |
| `reason` | `TEXT` | `NOT NULL` | Lý do (Hỏng hóc, sai số kiểm kê, hết hạn...) |
| `status` | `stock_doc_status`| `NOT NULL, DEFAULT 'DRAFT'` | DRAFT, POSTED, CANCELLED |
| `created_by` | `UUID` | `NOT NULL, FK -> users(id) ON DELETE RESTRICT` | Người tạo phiếu |
| `approved_by` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE RESTRICT` | Quản lý kho duyệt |
| `posted_at` | `TIMESTAMPTZ` | `NULLABLE` | Thời điểm ghi sổ điều chỉnh |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, adjustment_code)`

#### 43. Bảng `stock_adjustment_items` (Chi tiết phiếu điều chỉnh)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `adjustment_id` | `UUID` | `NOT NULL, FK -> stock_adjustments(id) ON DELETE CASCADE`| Thuộc phiếu điều chỉnh |
| `product_id` | `UUID` | `NOT NULL, FK -> products(id) ON DELETE RESTRICT` | Sản phẩm |
| `system_quantity` | `NUMERIC(12, 3)`| `NOT NULL` | Tồn trên hệ thống tại thời điểm kiểm tra |
| `counted_quantity`| `NUMERIC(12, 3)`| `NOT NULL` | Số lượng đếm thực tế |
| `difference_quantity` | `NUMERIC(12, 3)`| `NOT NULL` | Chênh lệch = counted - system (+ tăng, - giảm) |

#### 44. Bảng `stocktakes` (Phiếu kiểm kê định kỳ)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `stocktake_code` | `VARCHAR(50)` | `NOT NULL` | Mã đợt kiểm kê (KK0001...) |
| `warehouse_id` | `UUID` | `NOT NULL, FK -> warehouses(id) ON DELETE RESTRICT`| Kho kiểm kê |
| `status` | `stocktake_status`| `NOT NULL, DEFAULT 'DRAFT'` | DRAFT, IN_PROGRESS, COMPLETED, CANCELLED |
| `started_at` | `TIMESTAMPTZ` | `NULLABLE` | Thời gian bắt đầu đếm |
| `completed_at` | `TIMESTAMPTZ` | `NULLABLE` | Thời gian hoàn tất |
| `created_by` | `UUID` | `NOT NULL, FK -> users(id) ON DELETE RESTRICT` | Người tạo đợt kiểm kê |
| `approved_by` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE RESTRICT` | Trưởng kho duyệt kết quả |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, stocktake_code)`

#### 45. Bảng `stocktake_items` (Chi tiết phiếu kiểm kê)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `stocktake_id` | `UUID` | `NOT NULL, FK -> stocktakes(id) ON DELETE CASCADE` | Thuộc phiếu kiểm kê |
| `product_id` | `UUID` | `NOT NULL, FK -> products(id) ON DELETE RESTRICT` | Sản phẩm |
| `expected_quantity` | `NUMERIC(12, 3)`| `NOT NULL` | Số tồn sổ sách lúc bắt đầu kiểm kê |
| `counted_quantity` | `NUMERIC(12, 3)`| `NULLABLE` | Số kiểm đếm thực tế |
| `difference_quantity` | `NUMERIC(12, 3)`| `NULLABLE` | Chênh lệch |

#### 46. Bảng `inventory_transactions` (Sổ cái biến động kho bất biến - Immutable Ledger)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `warehouse_id` | `UUID` | `NOT NULL, FK -> warehouses(id) ON DELETE RESTRICT`| Biến động tại kho nào |
| `product_id` | `UUID` | `NOT NULL, FK -> products(id) ON DELETE RESTRICT` | Sản phẩm nào |
| `transaction_type` | `inventory_transaction_type`| `NOT NULL` | RECEIPT, ISSUE, TRANSFER_OUT, TRANSFER_IN, ADJUST... |
| `reference_type`| `VARCHAR(50)` | `NOT NULL` | STOCK_RECEIPT, STOCK_ISSUE, STOCK_TRANSFER, STOCK_ADJUSTMENT |
| `reference_id` | `VARCHAR(100)` | `NOT NULL` | ID của chứng từ gốc |
| `quantity_change` | `NUMERIC(12, 3)`| `NOT NULL` | Số lượng biến động (+ tăng, - giảm) |
| `unit_cost` | `NUMERIC(15, 2)`| `NOT NULL, DEFAULT 0.00` | Giá vốn tại thời điểm phát sinh giao dịch |
| `balance_after` | `NUMERIC(12, 3)`| `NOT NULL` | Số tồn thực tế sau giao dịch |
| `occurred_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời điểm nghiệp vụ xảy ra |
| `created_by` | `UUID` | `NOT NULL, FK -> users(id) ON DELETE RESTRICT` | Người xác nhận đăng sổ |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời điểm ghi vào DB (Không sửa/xóa) |

#### 47. Bảng `inventory_reservations` (Sổ giữ hàng cho đơn bán)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `warehouse_id` | `UUID` | `NOT NULL, FK -> warehouses(id) ON DELETE RESTRICT`| Giữ tại kho nào |
| `product_id` | `UUID` | `NOT NULL, FK -> products(id) ON DELETE RESTRICT` | Sản phẩm nào |
| `sales_order_id`| `UUID` | `NOT NULL, FK -> sales_orders(id) ON DELETE CASCADE`| Giữ cho đơn hàng nào |
| `quantity` | `NUMERIC(12, 3)`| `NOT NULL` | Số lượng giữ |
| `status` | `reservation_status`| `NOT NULL, DEFAULT 'ACTIVE'` | ACTIVE, FULFILLED, RELEASED |
| `reserved_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời điểm tạo lệnh giữ |
| `released_at` | `TIMESTAMPTZ` | `NULLABLE` | Thời điểm giải phóng hàng (hủy đơn hoặc hoàn thành) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |

---

### NHÓM 5: SALES ORDER (ĐƠN BÁN HÀNG)

#### 48. Bảng `sales_orders` (Đơn hàng bán)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `organization_id`| `UUID` | `NOT NULL, FK -> organizations(id)` | Thuộc tổ chức |
| `order_code` | `VARCHAR(50)` | `NOT NULL` | Mã đơn hàng (SO0001...) |
| `customer_id` | `UUID` | `NOT NULL, FK -> customers(id) ON DELETE RESTRICT` | Khách hàng đặt mua |
| `deal_id` | `UUID` | `NULLABLE, FK -> deals(id) ON DELETE SET NULL` | Chuyển đổi từ Deal nào |
| `warehouse_id` | `UUID` | `NOT NULL, FK -> warehouses(id) ON DELETE RESTRICT`| Kho dự kiến xuất hàng |
| `order_date` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Ngày đặt hàng |
| `expected_delivery_date` | `DATE` | `NULLABLE` | Ngày hẹn giao hàng |
| `status` | `sales_order_status`| `NOT NULL, DEFAULT 'DRAFT'` | DRAFT, CONFIRMED, PARTIALLY_FULFILLED, FULFILLED, CANCELLED |
| `subtotal` | `NUMERIC(15, 2)`| `NOT NULL, DEFAULT 0.00` | Tổng tiền hàng trước thuế/chiết khấu |
| `discount_amount`| `NUMERIC(15, 2)`| `NOT NULL, DEFAULT 0.00` | Tổng giá trị chiết khấu đơn hàng |
| `tax_amount` | `NUMERIC(15, 2)`| `NOT NULL, DEFAULT 0.00` | Tổng tiền thuế GTGT (VAT) |
| `total_amount` | `NUMERIC(15, 2)`| `NOT NULL, DEFAULT 0.00` | Tổng tiền thanh toán = subtotal - discount + tax |
| `note` | `TEXT` | `NULLABLE` | Ghi chú đơn hàng |
| `created_by` | `UUID` | `NOT NULL, FK -> users(id) ON DELETE RESTRICT` | Nhân viên kinh doanh tạo đơn |
| `confirmed_by` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE RESTRICT` | Người bấm xác nhận đơn |
| `confirmed_at` | `TIMESTAMPTZ` | `NULLABLE` | Thời điểm xác nhận đơn |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Unique constraint:* `UNIQUE(organization_id, order_code)`

#### 49. Bảng `sales_order_items` (Chi tiết dòng sản phẩm đơn bán hàng)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `sales_order_id`| `UUID` | `NOT NULL, FK -> sales_orders(id) ON DELETE CASCADE`| Thuộc đơn hàng |
| `product_id` | `UUID` | `NOT NULL, FK -> products(id) ON DELETE RESTRICT` | Sản phẩm |
| `sku_snapshot` | `VARCHAR(100)` | `NOT NULL` | Đóng băng SKU tại thời điểm đặt |
| `product_name_snapshot` | `VARCHAR(255)` | `NOT NULL` | Đóng băng Tên sản phẩm |
| `uom_snapshot` | `VARCHAR(50)` | `NOT NULL` | Đóng băng Đơn vị tính |
| `quantity` | `NUMERIC(12, 3)`| `NOT NULL` | Số lượng đặt mua |
| `fulfilled_quantity` | `NUMERIC(12, 3)`| `NOT NULL, DEFAULT 0.000` | Số lượng đã thực xuất kho |
| `unit_price` | `NUMERIC(15, 2)`| `NOT NULL, DEFAULT 0.00` | Đơn giá bán tại thời điểm đặt |
| `discount_amount`| `NUMERIC(15, 2)`| `NOT NULL, DEFAULT 0.00` | Chiết khấu từng dòng |
| `tax_rate` | `NUMERIC(5, 2)` | `NOT NULL, DEFAULT 0.00` | Mức thuế % (ví dụ 8.00, 10.00) |
| `line_total` | `NUMERIC(15, 2)`| `NOT NULL, DEFAULT 0.00` | Thành tiền dòng = (qty * price - discount) * (1 + tax_rate/100) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian tạo |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời gian cập nhật |
*Check constraint:* `CHECK (fulfilled_quantity <= quantity)`

#### 50. Bảng `sales_order_status_histories` (Lịch sử chuyển trạng thái đơn hàng)
| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, DEFAULT gen_random_uuid()` | Khóa chính |
| `sales_order_id`| `UUID` | `NOT NULL, FK -> sales_orders(id) ON DELETE CASCADE`| Thuộc đơn hàng |
| `from_status` | `sales_order_status`| `NULLABLE` | Trạng thái trước |
| `to_status` | `sales_order_status`| `NOT NULL` | Trạng thái mới chuyển sang |
| `changed_by` | `UUID` | `NULLABLE, FK -> users(id) ON DELETE SET NULL` | Người thực hiện thao tác |
| `changed_at` | `TIMESTAMPTZ` | `NOT NULL, DEFAULT NOW()` | Thời điểm chuyển |
| `note` | `TEXT` | `NULLABLE` | Lý do thay đổi trạng thái |

---

## 4. CHIẾN LƯỢC CHỈ MỤC TỐI ƯU TRUY VẤN (INDEXING STRATEGY)

Để đảm bảo hiệu năng cao cho hệ thống trên quy mô lớn, các chỉ mục (Indexes) được tạo có chủ đích:

### 4.1. Chỉ mục lọc Đa tổ chức (Tenant Isolation Filters)
- Tạo Composite B-Tree Index cho cặp `(organization_id, status)` và `(organization_id, created_at DESC)` trên tất cả các bảng giao dịch chính (`leads`, `deals`, `sales_orders`, `stock_receipts`, `stock_issues`, `attendance_records`).
- Cho phép truy vấn danh sách phân trang trang chủ đạt tốc độ dưới $5\text{ms}$.

### 4.2. Chỉ mục tìm kiếm tồn kho nhanh (Inventory Balance Lookups)
```sql
CREATE UNIQUE INDEX idx_inv_balance_org_wh_prod 
ON inventory_balances(organization_id, warehouse_id, product_id);

CREATE INDEX idx_inv_tx_lookup 
ON inventory_transactions(organization_id, warehouse_id, product_id, occurred_at DESC);
```

### 4.3. Chỉ mục GIN cho Dữ liệu JSONB trong Audit Log
```sql
CREATE INDEX idx_audit_logs_old_val_gin ON audit_logs USING gin (old_values);
CREATE INDEX idx_audit_logs_new_val_gin ON audit_logs USING gin (new_values);
CREATE INDEX idx_audit_logs_entity ON audit_logs (organization_id, entity_type, entity_id, created_at DESC);
```

### 4.4. Chỉ mục Full-text Search (Tìm kiếm khách hàng, đơn hàng, sản phẩm tiếng Việt)
```sql
CREATE INDEX idx_products_search ON products USING gin (to_tsvector('simple', name || ' ' || sku));
CREATE INDEX idx_customers_search ON customers USING gin (to_tsvector('simple', name || ' ' || customer_code || ' ' || coalesce(phone, '')));
```
