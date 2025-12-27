# Hướng dẫn Deploy OpenProject trên Coolify

Tài liệu này hướng dẫn cách deploy OpenProject lên Coolify để tích hợp với KIDO OKR-BSC System.

## 1. Chuẩn bị
- Đảm bảo bạn đã có tài khoản Coolify và Server đã kết nối.
- Domain dự kiến cho OpenProject (ví dụ: `pm.kido.vn` hoặc `openproject.kido.vn`).

## 2. Tạo Service trên Coolify
1. Vào Project của bạn trên Coolify dashboard.
2. Chọn **"Add Resource"** (hoặc nút `+`).
3. Chọn type là **"Docker Compose"**.

## 3. Cấu hình Docker Compose
Copy nội dung từ file `deploy/docker-compose.openproject.yml` và dán vào phần configuration của Coolify.

```yaml
version: '3.8'

services:
  db:
    image: postgres:13
    restart: always
    environment:
      POSTGRES_DB: openproject
      POSTGRES_USER: openproject
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - openproject_pgdata:/var/lib/postgresql/data

  cache:
    image: memcached
    restart: always

  web:
    image: openproject/community:13
    restart: always
    environment:
      OPENPROJECT_HTTPS: "true"
      OPENPROJECT_HOST__NAME: ${OPENPROJECT_DOMAIN}
      OPENPROJECT_SECRET__KEY__BASE: ${SECRET_KEY_BASE}
      OPENPROJECT_RAILS__CACHE__STORE: memcache_time_based_store
      OPENPROJECT_CACHE__MEMCACHE__SERVER: cache:11211
      DATABASE_URL: postgres://openproject:${POSTGRES_PASSWORD}@db:5432/openproject
    volumes:
      - openproject_static:/var/openproject/assets
      - openproject_storage:/var/openproject/storage
    depends_on:
      - db
      - cache
    ports:
      - "8080:80"

volumes:
  openproject_pgdata:
  openproject_static:
  openproject_storage:
```

## 4. Cài đặt Environment Variables
Trong tab **Environment Variables** trên Coolify, thêm các biến sau:

| Variable Name | Value Example | Description |
| :--- | :--- | :--- |
| `POSTGRES_PASSWORD` | `(Check previously set value)` | Password cho DB PostgreSQL nội bộ của OpenProject |
| `OPENPROJECT_DOMAIN` | `openproject.61.28.229.105.sslip.io` | Domain SSL (Coolify handle) |
| `SECRET_KEY_BASE` | `(Check previous value)` | Chuỗi bảo mật session |

## 5. Cấu hình Domains
1. Vào tab **General** hoặc **Domains**.
2. Set Domain: `https://openproject.61.28.229.105.sslip.io` (Chú ý HTTPS).
3. Đảm bảo cấu hình DNS (A record) trỏ về IP của server Coolify.

## 6. Post-Deployment Setup (Sau khi deploy thành công)
1. Truy cập vào domain `https://pm.kido.vn`.
2. Login mặc định: `admin` / `admin`.
3. Hệ thống sẽ yêu cầu đổi password ngay lần đầu.
4. Chọn ngôn ngữ (Tiếng Việt hoặc English).
5. **Quan trọng**: Vào **Administration > Users & Permissions > API**.
    - Tạo một user "bot" hoặc dùng admin user.
    - Generate **API Key** (Access Token).
    - Copy Key này để cấu hình vào KIDO System (biến môi trường `NEXT_PUBLIC_OPENPROJECT_API_KEY`).

## 7. Cấu hình CORS (Để cho phép KIDO iframe)
Để KIDO app (`app.kido.vn`) có thể embed OpenProject, bạn cần cho phép Iframe.
Vào **Administration > System settings > General**:
- Tìm mục **Protocol** hoặc **Security**.
- Kiểm tra phần **Allow iframe embedding**: Chọn "Allow usage within an iframe".
- Nếu cần bảo mật cao hơn, có thể cần cấu hình CSP (Content Security Policy) header trong Nginx proxy của Coolify để chỉ cho phép `app.kido.vn`.
