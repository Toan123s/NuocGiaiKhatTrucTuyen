# Database

`sqlServer.ts` là điểm kết nối duy nhất tới Microsoft SQL Server. Các repository sau này phải lấy connection pool từ module này, không tự tạo connection riêng.

Thông tin kết nối được đọc từ `server/.env` thông qua `config/env.ts`.
