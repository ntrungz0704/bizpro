-- ==============================================================================
-- BIZPRO+ REAL ENTERPRISE SEED DATA (VIETNAMESE BUSINESSES, ZERO MOCKS)
-- ==============================================================================

BEGIN;

-- Disable RLS restrictions during seed
SET app.current_organization_id = '1e6c245d-c583-4f04-8aff-552e07fb4743';

DO $$
DECLARE
    v_org_id UUID := '1e6c245d-c583-4f04-8aff-552e07fb4743';
    v_admin_id UUID := '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
    v_staff_id UUID := 'f2b8e5a7-565e-4b53-b8e6-e0e11d7738f5';

    -- Query existing warehouse IDs
    v_wh_hn UUID;
    v_wh_hcm UUID;

    -- Query existing category and uom IDs
    v_cat_thietbi UUID;
    v_cat_tieudung UUID;
    v_uom_cai UUID;
    v_uom_bo UUID;

    -- Query existing HRM metadata
    v_dept_bod UUID;
    v_dept_sales UUID;
    v_dept_tech UUID;
    v_dept_ops UUID;
    v_dept_hrm UUID;

    v_pos_dir UUID;
    v_pos_mgr UUID;
    v_pos_lead UUID;
    v_pos_senior UUID;
    v_pos_staff UUID;

    v_lt_al UUID;
    v_lt_sl UUID;

    -- Product IDs
    v_p_dell UUID := 'd1111111-1111-4111-8111-111111111111';
    v_p_mac UUID := 'd2222222-2222-4222-8222-222222222222';
    v_p_lg UUID := 'd3333333-3333-4333-8333-333333333333';
    v_p_key UUID := 'd4444444-4444-4444-8444-444444444444';
    v_p_mouse UUID := 'd5555555-5555-4555-8555-555555555555';
    v_p_srv UUID := 'd6666666-6666-4666-8666-666666666666';
    v_p_router UUID := 'd7777777-7777-4777-8777-777777777777';
    v_p_ups UUID := 'd8888888-8888-4888-8888-888888888888';

    -- Customer IDs
    v_c_fpt UUID := 'e1111111-1111-4111-8111-111111111111';
    v_c_vin UUID := 'e2222222-2222-4222-8222-222222222222';
    v_c_frt UUID := 'e3333333-3333-4333-8333-333333333333';
    v_c_nam UUID := 'e4444444-4444-4444-8444-444444444444';
    v_c_phuong UUID := 'e5555555-5555-4555-8555-555555555555';

    -- Pipeline & Stages
    v_pipeline_id UUID := 'f1111111-1111-4111-8111-111111111111';
    v_st_new UUID := 'f2222222-2222-4222-8222-222222222222';
    v_st_contacted UUID := 'f3333333-3333-4333-8333-333333333333';
    v_st_qualified UUID := 'f4444444-4444-4444-8444-444444444444';
    v_st_proposal UUID := 'f5555555-5555-4555-8555-555555555555';
    v_st_won UUID := 'f6666666-6666-4666-8666-666666666666';
    v_st_lost UUID := 'f7777777-7777-4777-8777-777777777777';

    -- Employees
    v_emp_admin UUID := '71111111-1111-4111-8111-111111111111';
    v_emp_tuan UUID := '72222222-2222-4222-8222-222222222222';
    v_emp_ngoc UUID := '73333333-3333-4333-8333-333333333333';
    v_emp_nam UUID := '74444444-4444-4444-8444-444444444444';
    v_emp_thang UUID := '75555555-5555-4555-8555-555555555555';
    v_emp_trang UUID := '76666666-6666-4666-8666-666666666666';

    -- Sales Orders
    v_so_1 UUID := '51111111-1111-4111-8111-111111111111';
    v_so_2 UUID := '52222222-2222-4222-8222-222222222222';
    v_so_3 UUID := '53333333-3333-4333-8333-333333333333';
    v_so_4 UUID := '54444444-4444-4444-8444-444444444444';

BEGIN
    -- Resolve existing master IDs
    SELECT id INTO v_wh_hn FROM warehouses WHERE organization_id = v_org_id AND code = 'WH-HN-01' LIMIT 1;
    SELECT id INTO v_wh_hcm FROM warehouses WHERE organization_id = v_org_id AND code = 'WH-HCM-01' LIMIT 1;

    SELECT id INTO v_cat_thietbi FROM product_categories WHERE organization_id = v_org_id AND code = 'CAT-THIẾT-BỊ' LIMIT 1;
    SELECT id INTO v_cat_tieudung FROM product_categories WHERE organization_id = v_org_id AND code = 'CAT-TIÊU-DÙNG' LIMIT 1;

    SELECT id INTO v_uom_cai FROM units_of_measure WHERE organization_id = v_org_id AND name = 'Cái' LIMIT 1;
    SELECT id INTO v_uom_bo FROM units_of_measure WHERE organization_id = v_org_id AND name = 'Bộ' LIMIT 1;

    SELECT id INTO v_dept_bod FROM departments WHERE organization_id = v_org_id AND code = 'BOD' LIMIT 1;
    SELECT id INTO v_dept_sales FROM departments WHERE organization_id = v_org_id AND code = 'SALES' LIMIT 1;
    SELECT id INTO v_dept_tech FROM departments WHERE organization_id = v_org_id AND code = 'TECH' LIMIT 1;
    SELECT id INTO v_dept_ops FROM departments WHERE organization_id = v_org_id AND code = 'OPERATIONS' LIMIT 1;
    SELECT id INTO v_dept_hrm FROM departments WHERE organization_id = v_org_id AND code = 'HRM' LIMIT 1;

    SELECT id INTO v_pos_dir FROM positions WHERE organization_id = v_org_id AND code = 'DIRECTOR' LIMIT 1;
    SELECT id INTO v_pos_mgr FROM positions WHERE organization_id = v_org_id AND code = 'MANAGER' LIMIT 1;
    SELECT id INTO v_pos_lead FROM positions WHERE organization_id = v_org_id AND code = 'TEAM_LEAD' LIMIT 1;
    SELECT id INTO v_pos_senior FROM positions WHERE organization_id = v_org_id AND code = 'SENIOR_STAFF' LIMIT 1;
    SELECT id INTO v_pos_staff FROM positions WHERE organization_id = v_org_id AND code = 'STAFF' LIMIT 1;

    SELECT id INTO v_lt_al FROM leave_types WHERE organization_id = v_org_id AND code = 'AL' LIMIT 1;
    SELECT id INTO v_lt_sl FROM leave_types WHERE organization_id = v_org_id AND code = 'SL' LIMIT 1;

    -- Fallback if any is null
    IF v_cat_thietbi IS NULL THEN
        SELECT id INTO v_cat_thietbi FROM product_categories WHERE organization_id = v_org_id LIMIT 1;
    END IF;
    IF v_uom_cai IS NULL THEN
        SELECT id INTO v_uom_cai FROM units_of_measure WHERE organization_id = v_org_id LIMIT 1;
    END IF;
    IF v_uom_bo IS NULL THEN
        v_uom_bo := v_uom_cai;
    END IF;

    -- 1. PRODUCTS
    INSERT INTO products (id, organization_id, category_id, unit_id, sku, name, description, cost_price, selling_price, min_stock_level, track_inventory, status)
    VALUES
        (v_p_dell, v_org_id, v_cat_thietbi, v_uom_cai, 'LAP-DELL-5520', 'Laptop Dell Latitude 5520 i7 16GB 512GB SSD', 'Dòng laptop doanh nhân bền bỉ, tích hợp bảo mật vân tay và vPro', 18500000, 22900000, 5, true, 'ACTIVE'),
        (v_p_mac, v_org_id, v_cat_thietbi, v_uom_cai, 'LAP-MAC-M3', 'Apple MacBook Pro 14 M3 Pro 18GB 512GB Space Black', 'Hiệu năng đồ họa đỉnh cao, pin 18h, màn hình Liquid Retina XDR', 42000000, 49990000, 3, true, 'ACTIVE'),
        (v_p_lg, v_org_id, v_cat_thietbi, v_uom_cai, 'MON-LG-27UP', 'Màn hình LG 27 inch 4K UHD IPS Type-C (27UP850N)', 'Chuẩn màu DCI-P3 95%, hỗ trợ sạc 90W qua cổng Type-C', 7200000, 9490000, 5, true, 'ACTIVE'),
        (v_p_key, v_org_id, v_cat_thietbi, v_uom_cai, 'KB-LOGI-MX', 'Bàn phím cơ không dây Logitech MX Mechanical Tactile', 'Gõ êm ái, kết nối 3 thiết bị đồng thời qua Bluetooth và Bolt', 2800000, 3690000, 10, true, 'ACTIVE'),
        (v_p_mouse, v_org_id, v_cat_thietbi, v_uom_cai, 'MOU-LOGI-3S', 'Chuột không dây Logitech MX Master 3S Dark Grey', 'Cảm biến 8000 DPI dùng trên mọi bề mặt kể cả mặt kính', 1950000, 2590000, 10, true, 'ACTIVE'),
        (v_p_srv, v_org_id, v_cat_thietbi, v_uom_bo, 'SRV-DELL-R750', 'Máy chủ Dell PowerEdge R750 2U Dual Intel Xeon Silver', 'Chuyên dụng ảo hóa VMware, cơ sở dữ liệu lớn và ERP', 120000000, 145000000, 2, true, 'ACTIVE'),
        (v_p_router, v_org_id, v_cat_thietbi, v_uom_cai, 'ROU-CISCO-C1111', 'Router định tuyến doanh nghiệp Cisco C1111-8P ISR', 'Bảo mật tường lửa thế hệ mới, cân bằng tải đa đường truyền', 14500000, 18200000, 4, true, 'ACTIVE'),
        (v_p_ups, v_org_id, v_cat_thietbi, v_uom_cai, 'UPS-APC-3KVA', 'Bộ lưu điện UPS APC Smart-UPS RT 3000VA 230V Online', 'Bảo vệ nguồn điện liên tục cho phòng server và trung tâm dữ liệu', 21000000, 26500000, 2, true, 'ACTIVE')
    ON CONFLICT (organization_id, sku) DO NOTHING;

    -- 2. INVENTORY BALANCES
    INSERT INTO inventory_balances (id, organization_id, warehouse_id, product_id, quantity_on_hand, quantity_reserved)
    VALUES
        (gen_random_uuid(), v_org_id, v_wh_hn, v_p_dell, 15, 2),
        (gen_random_uuid(), v_org_id, v_wh_hn, v_p_mac, 8, 1),
        (gen_random_uuid(), v_org_id, v_wh_hn, v_p_lg, 25, 4),
        (gen_random_uuid(), v_org_id, v_wh_hn, v_p_key, 40, 5),
        (gen_random_uuid(), v_org_id, v_wh_hn, v_p_mouse, 35, 3),
        (gen_random_uuid(), v_org_id, v_wh_hn, v_p_srv, 3, 1),
        (gen_random_uuid(), v_org_id, v_wh_hn, v_p_router, 12, 2),
        (gen_random_uuid(), v_org_id, v_wh_hn, v_p_ups, 6, 1)
    ON CONFLICT (organization_id, warehouse_id, product_id) DO UPDATE
    SET quantity_on_hand = EXCLUDED.quantity_on_hand, quantity_reserved = EXCLUDED.quantity_reserved;

    -- 3. CRM CUSTOMERS
    INSERT INTO customers (id, organization_id, customer_code, customer_type, name, email, phone, address, tax_code, status)
    VALUES
        (v_c_fpt, v_org_id, 'KH-FPT-01', 'BUSINESS', 'Công ty Cổ phần Công nghệ FPT Hà Nội', 'contact@fpt.com.vn', '024 7300 7300', 'Tòa nhà FPT, Phố Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội', '0101248141', 'ACTIVE'),
        (v_c_vin, v_org_id, 'KH-VIN-02', 'BUSINESS', 'Tập đoàn Vingroup - Chi nhánh Phía Bắc', 'info@vingroup.net', '024 3974 9999', 'Số 7 Đường Bằng Lăng 1, KĐT Vinhomes Riverside, Long Biên, Hà Nội', '0101245486', 'ACTIVE'),
        (v_c_frt, v_org_id, 'KH-FRT-03', 'BUSINESS', 'Công ty Cổ phần Bán lẻ Kỹ thuật số FPT (FPT Shop)', 'fptshop@fpt.com.vn', '028 7302 3456', '261 Khánh Hội, Phường 5, Quận 4, TP. Hồ Chí Minh', '0311609355', 'ACTIVE'),
        (v_c_nam, v_org_id, 'KH-NAM-04', 'INDIVIDUAL', 'Nguyễn Hoàng Nam (Khách hàng VIP)', 'nam.nh@gmail.com', '0988 123 456', '45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', NULL, 'ACTIVE'),
        (v_c_phuong, v_org_id, 'KH-PHUONG-05', 'INDIVIDUAL', 'Trần Thị Mai Phương', 'phuong.tran@gmail.com', '0912 888 999', '120 Hoàng Hoa Thám, Phường Thụy Khuê, Tây Hồ, Hà Nội', NULL, 'ACTIVE')
    ON CONFLICT (organization_id, customer_code) DO NOTHING;

    -- 4. CRM PIPELINES & STAGES
    INSERT INTO pipelines (id, organization_id, name, code, is_default, status)
    VALUES
        (v_pipeline_id, v_org_id, 'Quy trình Bán hàng Doanh nghiệp B2B', 'PIPE-B2B', true, 'ACTIVE')
    ON CONFLICT (organization_id, code) DO NOTHING;

    INSERT INTO pipeline_stages (id, organization_id, pipeline_id, name, code, position, probability, is_won, is_lost)
    VALUES
        (v_st_new, v_org_id, v_pipeline_id, 'Mới tiếp nhận', 'STAGE-NEW', 1, 10, false, false),
        (v_st_contacted, v_org_id, v_pipeline_id, 'Đã liên hệ & Khảo sát', 'STAGE-CONTACTED', 2, 25, false, false),
        (v_st_qualified, v_org_id, v_pipeline_id, 'Đủ điều kiện & Báo giá', 'STAGE-QUALIFIED', 3, 50, false, false),
        (v_st_proposal, v_org_id, v_pipeline_id, 'Đàm phán hợp đồng', 'STAGE-PROPOSAL', 4, 75, false, false),
        (v_st_won, v_org_id, v_pipeline_id, 'Chốt thành công (Won)', 'STAGE-WON', 5, 100, true, false),
        (v_st_lost, v_org_id, v_pipeline_id, 'Thất bại (Lost)', 'STAGE-LOST', 6, 0, false, true)
    ON CONFLICT (pipeline_id, code) DO NOTHING;

    -- 5. CRM LEADS
    INSERT INTO leads (id, organization_id, contact_name, company_name, email, phone, source, status, assigned_to)
    VALUES
        (gen_random_uuid(), v_org_id, 'Vũ Đình Hưng', 'Công ty TNHH Cơ Khí Xây Dựng Á Châu', 'hung.vd@achaucorp.vn', '0903 456 789', 'Website', 'NEW', v_staff_id),
        (gen_random_uuid(), v_org_id, 'Phạm Thu Thảo', 'Tập đoàn Giáo Dục Quốc Tế EduViet', 'thao.pt@eduviet.edu.vn', '0918 222 333', 'Facebook Ads', 'CONTACTED', v_staff_id),
        (gen_random_uuid(), v_org_id, 'Nguyễn Thanh Tùng', 'Ngân hàng TMCP Việt Á - Khối Vận Hành', 'tung.nt@vietabank.com.vn', '0977 888 999', 'Hotline', 'QUALIFIED', v_admin_id),
        (gen_random_uuid(), v_org_id, 'Đặng Hoàng Yến', 'Chuỗi Nhà Thuốc An Tâm Pharmacy', 'yen.dh@antam.vn', '0934 111 222', 'Giới thiệu', 'QUALIFIED', v_admin_id),
        (gen_random_uuid(), v_org_id, 'Lê Quang Huy', 'Công ty Logistics Đại Dương Xanh', 'huy.lq@bluesealog.com', '0945 666 777', 'Triển lãm Vietnam Expo', 'NEW', v_staff_id),
        (gen_random_uuid(), v_org_id, 'Trịnh Lan Anh', 'Công ty Cổ phần Thực phẩm Sạch Xanh', 'lananh@xanhfood.vn', '0982 333 444', 'Website', 'CONVERTED', v_admin_id)
    ON CONFLICT DO NOTHING;

    -- 6. CRM DEALS
    INSERT INTO deals (id, organization_id, pipeline_id, stage_id, customer_id, title, amount, currency, expected_close_date, assigned_to, status)
    VALUES
        (gen_random_uuid(), v_org_id, v_pipeline_id, v_st_proposal, v_c_fpt, 'Hợp đồng cung cấp 50 máy trạm Workstation Dell cho FPT', 1250000000, 'VND', CURRENT_DATE + INTERVAL '15 days', v_admin_id, 'OPEN'),
        (gen_random_uuid(), v_org_id, v_pipeline_id, v_st_qualified, v_c_vin, 'Nâng cấp hệ thống hạ tầng mạng & Server cho Vingroup', 850000000, 'VND', CURRENT_DATE + INTERVAL '20 days', v_admin_id, 'OPEN'),
        (gen_random_uuid(), v_org_id, v_pipeline_id, v_st_contacted, v_c_frt, 'Dự án trung tâm dữ liệu dự phòng Cloud FPT Shop', 1600000000, 'VND', CURRENT_DATE + INTERVAL '30 days', v_staff_id, 'OPEN'),
        (gen_random_uuid(), v_org_id, v_pipeline_id, v_st_won, v_c_nam, 'Cung ứng thiết bị phòng họp thông minh cao cấp VIP', 310000000, 'VND', CURRENT_DATE - INTERVAL '2 days', v_staff_id, 'WON'),
        (gen_random_uuid(), v_org_id, v_pipeline_id, v_st_new, v_c_phuong, 'Gói mua sắm máy tính và thiết bị văn phòng trọn gói 2026', 420000000, 'VND', CURRENT_DATE + INTERVAL '45 days', v_staff_id, 'OPEN')
    ON CONFLICT DO NOTHING;

    -- 7. SALES ORDERS
    INSERT INTO sales_orders (
        id, organization_id, order_code, customer_id, warehouse_id, order_date, status, payment_status,
        subtotal, total_amount, paid_amount, remaining_balance, shipping_address_snapshot, note, created_by
    )
    VALUES
        (
            v_so_1, v_org_id, 'SO-2026-001', v_c_fpt, v_wh_hn, CURRENT_TIMESTAMP - INTERVAL '3 days',
            'FULFILLED', 'PAID', 127450000, 127450000, 127450000, 0,
            '{"recipientName": "Công ty FPT Hà Nội", "phone": "024 7300 7300", "address": "Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội"}'::jsonb,
            'Đơn hàng hoàn tất bàn giao đầy đủ cho bộ phận CNTT FPT', v_admin_id
        ),
        (
            v_so_2, v_org_id, 'SO-2026-002', v_c_vin, v_wh_hn, CURRENT_TIMESTAMP - INTERVAL '1 day',
            'CONFIRMED', 'PARTIALLY_PAID', 131800000, 131800000, 50000000, 81800000,
            '{"recipientName": "Ban Quản lý Dự án Vingroup", "phone": "024 3974 9999", "address": "Số 7 Bằng Lăng 1, Vinhomes Riverside, Long Biên"}'::jsonb,
            'Đang đóng gói và kiểm thử thiết bị trước khi xuất kho giao xe tải', v_admin_id
        ),
        (
            v_so_3, v_org_id, 'SO-2026-003', v_c_frt, v_wh_hn, CURRENT_TIMESTAMP - INTERVAL '2 hours',
            'CONFIRMED', 'UNPAID', 290000000, 290000000, 0, 290000000,
            '{"recipientName": "Trung tâm Phân phối FPT Shop", "phone": "028 7302 3456", "address": "261 Khánh Hội, Quận 4, TP. HCM"}'::jsonb,
            'Đã tự động khóa giữ 2 Máy chủ Dell PowerEdge R750 trong kho an toàn', v_admin_id
        ),
        (
            v_so_4, v_org_id, 'SO-2026-004', v_c_nam, v_wh_hn, CURRENT_TIMESTAMP,
            'DRAFT', 'UNPAID', 49990000, 49990000, 0, 49990000,
            '{"recipientName": "Nguyễn Hoàng Nam", "phone": "0988 123 456", "address": "45 Lê Duẩn, Quận 1, TP. HCM"}'::jsonb,
            'Báo giá 1 MacBook Pro 14 M3 Pro cho khách hàng VIP xem xét', v_staff_id
        )
    ON CONFLICT (organization_id, order_code) DO NOTHING;

    -- 8. SALES ORDER ITEMS
    INSERT INTO sales_order_items (id, sales_order_id, product_id, sku_snapshot, product_name_snapshot, uom_snapshot, quantity, fulfilled_quantity, unit_price, line_total)
    VALUES
        (gen_random_uuid(), v_so_1, v_p_dell, 'LAP-DELL-5520', 'Laptop Dell Latitude 5520 i7 16GB 512GB SSD', 'cai', 5, 5, 22900000, 114500000),
        (gen_random_uuid(), v_so_1, v_p_mouse, 'MOU-LOGI-3S', 'Chuột không dây Logitech MX Master 3S Dark Grey', 'cai', 5, 5, 2590000, 12950000),
        (gen_random_uuid(), v_so_2, v_p_lg, 'MON-LG-27UP', 'Màn hình LG 27 inch 4K UHD IPS Type-C (27UP850N)', 'cai', 10, 0, 9490000, 94900000),
        (gen_random_uuid(), v_so_2, v_p_key, 'KB-LOGI-MX', 'Bàn phím cơ không dây Logitech MX Mechanical Tactile', 'cai', 10, 0, 3690000, 36900000),
        (gen_random_uuid(), v_so_3, v_p_srv, 'SRV-DELL-R750', 'Máy chủ Dell PowerEdge R750 2U Dual Intel Xeon Silver', 'bo', 2, 0, 145000000, 290000000),
        (gen_random_uuid(), v_so_4, v_p_mac, 'LAP-MAC-M3', 'Apple MacBook Pro 14 M3 Pro 18GB 512GB Space Black', 'cai', 1, 0, 49990000, 49990000)
    ON CONFLICT DO NOTHING;

    -- 9. EMPLOYEES
    INSERT INTO employees (id, organization_id, employee_code, full_name, email, phone, department_id, position_id, employment_status, hire_date)
    VALUES
        (v_emp_admin, v_org_id, 'NV-001', 'Nguyễn Văn Admin', 'admin@bizpro.vn', '0912 345 678', v_dept_bod, v_pos_dir, 'OFFICIAL', '2024-01-01'),
        (v_emp_tuan, v_org_id, 'NV-002', 'Trần Quốc Tuấn', 'tuan.tq@bizpro.vn', '0903 111 222', v_dept_sales, v_pos_mgr, 'OFFICIAL', '2024-03-15'),
        (v_emp_ngoc, v_org_id, 'NV-003', 'Lê Thị Bích Ngọc', 'ngoc.ltb@bizpro.vn', '0918 333 444', v_dept_sales, v_pos_staff, 'OFFICIAL', '2024-06-01'),
        (v_emp_nam, v_org_id, 'NV-004', 'Phạm Hoàng Nam', 'nam.ph@bizpro.vn', '0977 555 666', v_dept_tech, v_pos_senior, 'OFFICIAL', '2024-04-10'),
        (v_emp_thang, v_org_id, 'NV-005', 'Vũ Đức Thắng', 'thang.vd@bizpro.vn', '0934 777 888', v_dept_ops, v_pos_lead, 'OFFICIAL', '2024-02-20'),
        (v_emp_trang, v_org_id, 'NV-006', 'Đỗ Thị Thu Trang', 'trang.dtt@bizpro.vn', '0982 999 000', v_dept_hrm, v_pos_staff, 'OFFICIAL', '2024-05-01')
    ON CONFLICT (organization_id, employee_code) DO NOTHING;

    -- 10. ATTENDANCE RECORDS (TODAY)
    INSERT INTO attendance_records (id, organization_id, employee_id, work_date, check_in_at, check_out_at, status)
    VALUES
        (gen_random_uuid(), v_org_id, v_emp_admin, CURRENT_DATE, CURRENT_DATE + TIME '07:55:00', NULL, 'PRESENT'),
        (gen_random_uuid(), v_org_id, v_emp_tuan, CURRENT_DATE, CURRENT_DATE + TIME '08:02:00', NULL, 'PRESENT'),
        (gen_random_uuid(), v_org_id, v_emp_ngoc, CURRENT_DATE, CURRENT_DATE + TIME '08:18:00', NULL, 'LATE'),
        (gen_random_uuid(), v_org_id, v_emp_nam, CURRENT_DATE, CURRENT_DATE + TIME '07:58:00', NULL, 'PRESENT'),
        (gen_random_uuid(), v_org_id, v_emp_thang, CURRENT_DATE, CURRENT_DATE + TIME '08:00:00', NULL, 'PRESENT'),
        (gen_random_uuid(), v_org_id, v_emp_trang, CURRENT_DATE, CURRENT_DATE + TIME '08:05:00', NULL, 'PRESENT')
    ON CONFLICT (organization_id, employee_id, work_date) DO NOTHING;

    -- 11. LEAVE REQUESTS
    INSERT INTO leave_requests (id, organization_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status)
    VALUES
        (gen_random_uuid(), v_org_id, v_emp_ngoc, v_lt_al, CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '4 days', 2, 'Giải quyết công việc cá nhân gia đình', 'PENDING'),
        (gen_random_uuid(), v_org_id, v_emp_nam, v_lt_al, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '2 days', 1, 'Khám sức khỏe tổng quát định kỳ', 'APPROVED'),
        (gen_random_uuid(), v_org_id, v_emp_thang, v_lt_al, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '5 days', 1, 'Đi dự đám cưới bạn thân', 'REJECTED')
    ON CONFLICT DO NOTHING;

    -- 12. NOTIFICATIONS (3 ACTIVE ACTIONABLE REAL NOTIFICATIONS)
    INSERT INTO notifications (id, organization_id, user_id, type, title, message, reference_type, reference_id, is_read)
    VALUES
        (gen_random_uuid(), v_org_id, v_admin_id, 'TASK_ASSIGNED', 'Đơn hàng #SO-2026-003 cần xuất kho giao hàng', 'Đơn hàng 290.000.000 đ của FPT Shop đã xác nhận và khóa giữ tồn kho', 'SALES_ORDER', 'SO-2026-003', false),
        (gen_random_uuid(), v_org_id, v_admin_id, 'APPROVAL_REQUIRED', 'Lê Thị Bích Ngọc gửi đơn xin nghỉ phép 2 ngày', 'Đơn xin nghỉ phép năm từ ngày 10/11 đến 11/11 đang chờ ban lãnh đạo duyệt', 'HR_LEAVE', 'LEAVE-001', false),
        (gen_random_uuid(), v_org_id, v_admin_id, 'WARNING', 'Cảnh báo: Máy chủ Dell PowerEdge R750 chạm ngưỡng tồn an toàn', 'Tồn kho khả dụng chỉ còn 1 máy trong khi định mức tối thiểu là 2 máy', 'INVENTORY', 'SRV-DELL-R750', false)
    ON CONFLICT DO NOTHING;

    -- 13. AUDIT LOGS
    INSERT INTO audit_logs (id, organization_id, user_id, module, action, entity_type, entity_id, new_values, ip_address, user_agent)
    VALUES
        (gen_random_uuid(), v_org_id, v_admin_id, 'Sales', 'CONFIRM', 'SalesOrder', v_so_3::text, '{"orderCode": "SO-2026-003", "detail": "Xác nhận đơn hàng và tự động khóa giữ tồn kho (Reserved: 2 máy chủ Dell R750)"}'::jsonb, '127.0.0.1', 'Mozilla/5.0 BizPro'),
        (gen_random_uuid(), v_org_id, v_admin_id, 'Organization', 'UPDATE_ORGANIZATION_PROFILE', 'Organization', v_org_id::text, '{"code": "BIZPRO-CORP", "detail": "Cập nhật thông tin doanh nghiệp và chính sách tiền tệ VND"}'::jsonb, '127.0.0.1', 'Mozilla/5.0 BizPro'),
        (gen_random_uuid(), v_org_id, v_admin_id, 'CRM', 'CREATE', 'Customer', v_c_fpt::text, '{"code": "KH-FPT-01", "name": "Công ty Cổ phần Công nghệ FPT Hà Nội"}'::jsonb, '127.0.0.1', 'Mozilla/5.0 BizPro')
    ON CONFLICT DO NOTHING;

END $$;

COMMIT;
