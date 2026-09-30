# BrewLite Tutorial

Tài liệu hướng dẫn cài đặt và làm việc với project NuocGiaiKhatTrucTuyen.

## 1. Công nghệ

- Frontend: React, Vite, TypeScript
- Backend: Node.js, TypeScript
- Database: Microsoft SQL Server
- Package manager: pnpm

## 2. Cài đặt yêu cầu

Cài đặt các công cụ sau:

- Node.js
- pnpm
- Git
- Microsoft SQL Server
- SQL Server Management Studio hoặc Azure Data Studio

Kiểm tra phiên bản:

```powershell
node --version
pnpm --version
git --version
```

## 3. Clone project

```powershell
git clone https://github.com/Toan123s/NuocGiaiKhatTrucTuyen.git
cd NuocGiaiKhatTrucTuyen
```

## 4. Cài đặt và chạy frontend

Tại thư mục gốc project:

```powershell
pnpm install
pnpm dev
```

Mở giao diện tại:

```text
http://localhost:8443/
```

Nếu terminal thường xuyên bị đóng process Vite, dùng lệnh chạy nền:

```powershell
pnpm dev:bg
```

Dừng process đang giữ port:

```powershell
pnpm dev:stop
```

Build kiểm tra frontend:

```powershell
pnpm build
```

## 5. Cài đặt và chạy backend

```powershell
cd server
pnpm install
Copy-Item .env.example .env
```

Mở `server/.env` và điền cấu hình SQL Server local:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=BrewLite
DB_USER=sa
DB_PASSWORD=your_sql_server_password
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

Không commit file `.env` lên Git.

Kiểm tra TypeScript:

```powershell
pnpm typecheck
```

Kiểm tra kết nối SQL Server:

```powershell
pnpm start
```

Backend hiện mới có phần kết nối database, chưa có API và nghiệp vụ hoàn chỉnh.

## 6. Database backup

Đặt file backup database tại:

```text
spript/database-backups/
```

Quy tắc đặt tên:

```text
BrewLite_YYYY-MM-DD.bak
```

Ví dụ:

```text
spript/database-backups/BrewLite_2026-09-30.bak
```

Backup chỉ nên chứa dữ liệu mẫu hoặc dữ liệu đã ẩn thông tin cá nhân. Không đưa mật khẩu, token hoặc dữ liệu production lên Git.

Có thể backup/restore bằng SQL Server Management Studio:

1. Kết nối SQL Server local.
2. Chọn database `BrewLite`.
3. Chọn `Tasks`.
4. Chọn `Back Up` hoặc `Restore Database`.
5. Chọn file trong `spript/database-backups/`.

## 7. Cấu trúc thư mục

```text
src/                         Frontend
  components/                Thành phần giao diện
  pages/                     Các trang giao diện
  data/                      Dữ liệu mẫu
  domain/                    Logic phía frontend
  hooks/                     React hooks
  shared/                    Thành phần dùng chung

server/                      Backend
  src/
    config/                  Cấu hình môi trường
    controllers/             Xử lý request
    database/                Kết nối SQL Server
    middlewares/             Auth, validation và error handling
    models/                  Kiểu dữ liệu
    repositories/            Đọc/ghi database
    routes/                  Khai báo API
    services/                Nghiệp vụ backend
    shared/                  Thành phần dùng chung

spript/                      Script và backup database
  database-backups/          File backup SQL Server
```

## 8. Quy trình Git

Cập nhật code mới trước khi làm việc:

```powershell
git pull origin main
```

Tạo branch riêng:

```powershell
git checkout -b feature/ten-chuc-nang
```

Kiểm tra thay đổi:

```powershell
git status
git diff
```

Commit:

```powershell
git add .
git commit -m "feat: ten chuc nang"
```

Push branch:

```powershell
git push origin feature/ten-chuc-nang
```

Sau đó tạo Pull Request vào branch `main`.

## 9. Quy tắc commit

```text
feat: thêm chức năng
fix: sửa lỗi
refactor: thay đổi cấu trúc code
docs: cập nhật tài liệu
chore: cập nhật cấu hình
```

Ví dụ:

```text
feat: add product api
fix: fix cart total
docs: update tutorial
```

## 10. Quy tắc bảo mật

- Không commit file `.env`.
- Không commit mật khẩu SQL Server.
- Không commit API key hoặc token.
- Không đưa dữ liệu người dùng thật vào backup.
- Không kết nối frontend trực tiếp tới SQL Server.
- Frontend gọi API backend, backend mới làm việc với database.
