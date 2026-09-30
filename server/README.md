# BrewLite Backend

Backend scaffold cho ứng dụng BrewLite, dùng Node.js + TypeScript và Microsoft SQL Server chạy local.

## Mục tiêu

- Cung cấp API cho sản phẩm, tài khoản, giỏ hàng và đơn hàng.
- Tách rõ HTTP, nghiệp vụ, truy cập dữ liệu và mô hình dữ liệu.
- Cho phép frontend kết nối qua một API duy nhất khi backend được triển khai.

## Cấu trúc

```text
server/
  docs/          Tài liệu API và quy ước tích hợp
  src/
    config/      Cấu hình môi trường và ứng dụng
    controllers/ Nhận request, gọi service, trả response
    database/    Kết nối DB, migrations, seed data
    middlewares/ Auth, validation, error handling, logging
    models/      Mô hình dữ liệu và kiểu domain
    repositories/Đọc/ghi dữ liệu, không chứa nghiệp vụ
    routes/      Khai báo endpoint và nối controller
    services/    Quy tắc nghiệp vụ
    shared/      Error, response, constants, utilities dùng chung
```

## Luồng phụ thuộc

```text
routes -> controllers -> services -> repositories -> database
              |             |
        middlewares       models/shared
```

Không để `routes` gọi trực tiếp database. Không để `repositories` chứa quy tắc nghiệp vụ.

## Thứ tự triển khai đề xuất

1. Cài dependency bằng `pnpm install` trong thư mục `server`.
2. Copy `.env.example` thành `.env` và điền thông tin SQL Server.
3. Chạy `pnpm start` để kiểm tra kết nối database.
4. Chọn framework HTTP và bắt đầu xây API.
5. Triển khai sản phẩm, đăng nhập, giỏ hàng và đơn hàng.
6. Kết nối frontend theo `docs/api-contract.md`.
