# SỔ TAY VẬN HÀNH & TRIỂN KHAI — BIZPRO+ PHASE 3C
## PRODUCTION DEPLOYMENT & OPERATIONS GUIDE

**Dự án:** BizPro+ Enterprise Business Management System  
**Giai đoạn:** Phase 3C  
**Ngày phát hành:** 06/11/2026  
**Mục tiêu:** Cung cấp quy trình vận hành, deploy, backup và troubleshooting chuẩn xác cho môi trường Production.

---

## 1. YÊU CẦU MÔI TRƯỜNG MÁY CHỦ (SYSTEM PREREQUISITES)
- **Hệ điều hành:** Linux (Ubuntu 22.04 LTS / Debian 12 / RHEL 9) hoặc Windows Server có WSL2 / Docker Engine.
- **Docker Engine:** Phiên bản $\ge$ 26.0.0.
- **Docker Compose:** Phiên bản $\ge$ v2.24.0.
- **Phần cứng tối thiểu:** 2 CPU Cores, 4GB RAM, 20GB SSD Storage.

---

## 2. QUY TRÌNH TRIỂN KHAI LẦN ĐẦU (INITIAL DEPLOYMENT)

### Bước 1: Sao chép tệp cấu hình bảo mật
```bash
cp .env.production.example .env.production
chmod 600 .env.production
```
*Lưu ý:* Điền đầy đủ các secret có độ entropy cao ($\ge$ 32 ký tự ngẫu nhiên) cho `POSTGRES_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `AUTH_RESPONSE_ENVELOPE_KEY`.

### Bước 2: Build các image sản phẩm
```bash
docker compose -p bizpro -f docker-compose.prod.yml --env-file .env.production build
```

### Bước 3: Khởi chạy toàn bộ hệ thống
```bash
docker compose -p bizpro -f docker-compose.prod.yml --env-file .env.production up -d
```

### Bước 4: Kiểm tra trạng thái sức khỏe container
```bash
docker compose -p bizpro -f docker-compose.prod.yml ps
```
Xác nhận tất cả container `bizpro_prod_postgres`, `bizpro_prod_backend`, `bizpro_prod_frontend`, `bizpro_prod_nginx` đều ở trạng thái `Up (healthy)`.

---

## 3. QUY TRÌNH CẬP NHẬT PHIÊN BẢN (ZERO-DOWNTIME UPDATE)

Khi phát hành phiên bản mới của mã nguồn:
```bash
# 1. Kéo mã nguồn mới
git pull origin main

# 2. Build image mới
docker compose -p bizpro -f docker-compose.prod.yml --env-file .env.production build backend frontend

# 3. Áp dụng migration (nếu có) và khởi động lại dịch vụ
docker compose -p bizpro -f docker-compose.prod.yml --env-file .env.production up -d --no-deps migration
docker compose -p bizpro -f docker-compose.prod.yml --env-file .env.production up -d --no-deps backend frontend nginx
```

---

## 4. QUY TRÌNH SAO LƯU & PHỤC HỒI DỮ LIỆU (BACKUP & RESTORE)

### Sao lưu cơ sở dữ liệu (Hot Backup)
```bash
docker exec -t bizpro_prod_postgres pg_dump -U bizpro_app -d bizpro_db -F c -b -v -f /tmp/bizpro_backup.dump
docker cp bizpro_prod_postgres:/tmp/bizpro_backup.dump ./backups/bizpro_backup_$(date +%Y%m%d_%H%M%S).dump
```

### Phục hồi cơ sở dữ liệu (Restore)
```bash
# Đưa backend về chế độ bảo trì
docker stop bizpro_prod_backend

# Phục hồi dữ liệu
docker cp ./backups/bizpro_backup.dump bizpro_prod_postgres:/tmp/bizpro_backup.dump
docker exec -t bizpro_prod_postgres pg_restore -U bizpro_app -d bizpro_db --clean --if-exists /tmp/bizpro_backup.dump

# Khởi động lại backend
docker start bizpro_prod_backend
```

---

## 5. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

1. **Backend báo lỗi Unhealthy:**
   - Kiểm tra log chi tiết: `docker logs --tail 100 bizpro_prod_backend`.
   - Kiểm tra kết nối DB: `docker exec -it bizpro_prod_backend curl http://localhost:4000/api/health/ready`.
2. **Nginx trả về HTTP 502 Bad Gateway:**
   - Kiểm tra xem backend/frontend có đang chạy: `docker ps`.
   - Kiểm tra kết nối mạng nội bộ: `docker network inspect bizpro_prod_network`.
3. **Migration bị treo hoặc thất bại:**
   - Xem log migration container: `docker logs bizpro_prod_migration`.
   - Tuyệt đối không xóa database volume nếu chưa sao lưu!
