# BrewLite

Khung đồ án Công nghệ phần mềm dùng Next.js, NestJS và PostgreSQL. Chỉ giao diện khách hàng.

## Đã làm và chưa làm

- Đã chạy: trang chính, 40 đồ uống có giá/mô tả, ảnh trống, tìm kiếm/lọc loại, responsive, loading/empty/error; GET /products; health; schema, trigger kiểm tra và dữ liệu demo 7 bảng.
- Chỉ có file khung: chi tiết món, đăng nhập/đăng ký, giỏ, checkout, thanh toán, kiểm tra kết quả, lịch sử/chi tiết đơn. View chưa có nghiệp vụ, API tương ứng trả HTTP 501.
- TODO trong source ghi rõ TV phụ trách, method, trang và điều kiện. Không có Admin/nhân viên.
- Compose hiện chạy DB; Docker web/API, CD và nghiệp vụ bảo mật/thanh toán là phần nhóm tiếp tục làm.

## Chạy bằng PostgreSQL

Yêu cầu Node.js 22+, npm và PostgreSQL (hoặc Docker Desktop).

1. Clone repo và chuyển sang nhánh `scaffold/brewlite-customer` nếu chưa merge PR.
2. Tại thư mục gốc, Windows: `copy .env_vidu .env`; macOS/Linux: `cp .env_vidu .env`.
3. Nếu dùng Docker: `docker compose up -d db`. Nếu có PostgreSQL sẵn: tạo database/user theo `.env`, sửa DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME cho đúng.
4. `npm install` (các lần sau dùng `npm ci` theo lockfile).
5. `npm run db:check` → `npm run db:migrate` → `npm run db:seed`.
6. `npm run dev` rồi mở http://localhost:3000. API: http://localhost:4000/products; health: http://localhost:4000/health.

Không cần tạo .env riêng trong frontend/backend. Cả hai đọc .env tại gốc repo. Chạy lệnh từ gốc bằng npm workspace scripts.
`.env_vidu` chứa tài khoản ví dụ local, không phải thông tin đăng nhập thật; `.env` đã được gitignore.
SQL nằm trong `backend/database/001_schema.sql`, `002_integrity.sql`, `003_seed.sql`. Xem [hướng dẫn và dữ liệu test](backend/database/README.md). Seed chạy lại không ghi đè sản phẩm/tồn đã có. Sửa dữ liệu bằng SQL/migration khi cần, chưa cần màn hình quản trị.
Nếu cổng 3000/4000/5432 đang dùng, giải phóng cổng hoặc đổi cấu hình đồng bộ (API_PORT/API_BASE_URL/FRONTEND_ORIGIN).

## Xem thử chưa cần cài database

Đổi `PRODUCT_DATA_SOURCE=sample` trong `.env`, chạy `npm run dev`. API đọc cùng file seed và health ghi rõ DB chưa kiểm tra. Không tự chuyển sang sample khi DB lỗi. Nghiệm thu phải dùng `postgres`.

## Kiểm tra và build

```sh
npm run typecheck
npm test
npm run build
npm run start -w backend
npm run start -w frontend
```

Build frontend không yêu cầu API/DB đang chạy; trang chính lấy dữ liệu theo request lúc runtime.

## Tài liệu cho nhóm

Backend tách rõ `routes/` → `controllers/` → `services/` → `models/`; xem [Vị trí viết logic và SQL](docs/VI_TRI_CODE.md).

- [Phân công 6 thành viên](docs/PHAN_CONG.md)
- [Lưu ý từng module](docs/LUU_Y_MODULE.md)
- [Bản đồ file cần sửa](docs/VI_TRI_CODE.md)
- [Cấu trúc thư mục](docs/CAU_TRUC.md)
- [Quy ước code](docs/QUY_UOC.md)
- [Phạm vi bộ khung](docs/YEU_CAU_BO_KHUNG.md)
- [Database và phần cần bổ sung](backend/database/README.md)

## Lưu ý tiếp tục triển khai

JWT/guard/DTO Auth chưa làm: giữ API khung trả 501 cho tới khi bảo mật hoàn chỉnh. Không dùng bản khung làm ứng dụng thu tiền thật.
Phân công đã cân lại: TV1 làm sản phẩm + khuyến mãi + Docker local; TV2 làm giỏ + giao diện checkout; TV3 làm Auth/bảo mật + CI/required checks; TV4 làm backend đơn/tồn; TV5 làm thanh toán/điểm; TV6 làm theo dõi đơn + CD/production và ghép E2E. Những phần TODO chưa được coi là hoàn thành đề Assignment 2.
