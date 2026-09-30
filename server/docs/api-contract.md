# API Contract

Đây là hợp đồng kết nối giữa frontend và backend. Backend team có thể thay đổi implementation nhưng nên giữ request/response ổn định.

## Base URL

```text
/api/v1
```

## Endpoints dự kiến

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| GET | `/products` | Danh sách sản phẩm, hỗ trợ lọc theo category và search |
| GET | `/products/:id` | Chi tiết sản phẩm, size và topping |
| POST | `/auth/login` | Đăng nhập và trả session/token |
| GET | `/me` | Lấy thông tin tài khoản hiện tại |
| POST | `/orders` | Tạo đơn hàng và thanh toán |
| GET | `/orders` | Lịch sử đơn của tài khoản hiện tại |
| GET | `/orders/:id` | Chi tiết một đơn hàng |

## Quy tắc response

- Thành công: `{ "data": ... }`
- Lỗi: `{ "error": { "code": "...", "message": "...", "details": {} } }`
- Tiền tệ dùng số nguyên VND, không dùng chuỗi đã format.
- Thời gian dùng ISO 8601 UTC.
- Không gửi mật khẩu trong response.

## Tích hợp frontend

Frontend hiện đang dùng dữ liệu mẫu trong `src/data/products.ts` và localStorage. Khi backend sẵn sàng, thay các nguồn này bằng API client riêng, không gọi API trực tiếp trong component UI.
