# BrewLite

Khung đồ án Công nghệ phần mềm dùng Next.js, NestJS và PostgreSQL. Chỉ giao diện khách hàng.

## Chạy bằng PostgreSQL

Yêu cầu Node.js 22+, npm và PostgreSQL (hoặc Docker Desktop).

1. Clone repo và chuyển sang nhánh `scaffold/brewlite-customer` nếu chưa merge PR.
2. Tại thư mục gốc, Windows: `copy .env_vidu .env`; macOS/Linux: `cp .env_vidu .env`.
3. Nếu dùng Docker: `docker compose up -d db`. Nếu có PostgreSQL sẵn: tạo database/user theo `.env`, sửa DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME cho đúng.
4. `npm install` (các lần sau dùng `npm ci` theo lockfile).
5. `npm run db:check` → `npm run db:migrate` → `npm run db:seed` → `npm run db:migrate`.
6. `npm run dev` rồi mở http://localhost:3000. API: http://localhost:4000/products; health: http://localhost:4000/health.

Không cần tạo .env riêng trong frontend/backend. Cả hai đọc .env tại gốc repo. Chạy lệnh từ gốc bằng npm workspace scripts.
`.env_vidu` chứa tài khoản ví dụ local, không phải thông tin đăng nhập thật; `.env` đã được gitignore.
SQL nằm trong `backend/database/` (`001_schema.sql`, `002_seed.sql`, `003_catalog.sql`, các migration sau đó). Xem [hướng dẫn và dữ liệu test](backend/database/README.md). Seed chạy lại không ghi đè sản phẩm/tồn đã có. Sửa dữ liệu bằng SQL/migration khi cần, chưa cần màn hình quản trị.
Các migration catalog cần sản phẩm có sẵn; lần migrate đầu tiên sẽ tự hoãn chúng nếu database đang trống. Sau khi seed, chạy migrate lần nữa để áp dụng công thức và ảnh sản phẩm.
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

## Chạy toàn bộ bằng Docker (web + API + database)

Yêu cầu Docker Desktop (hoặc Docker Engine + Compose v2) và Node.js 22+ (chỉ để chạy migrate/seed).

1. Tạo `.env`: Windows `copy .env_vidu .env`; macOS/Linux `cp .env_vidu .env`.
2. Đặt `JWT_SECRET` riêng trong `.env` (từ 32 ký tự, không chứa `local_only` hay `replace_`, vì image API chạy `NODE_ENV=production`):
   `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
3. Bật database rồi tạo bảng và dữ liệu mẫu:
   ```sh
   docker compose up -d --wait db
   npm ci
   npm run db:migrate && npm run db:seed && npm run db:migrate
   ```
4. Chạy web và API: `docker compose up -d --build`.
5. Kiểm tra: web http://localhost:3000, API http://localhost:4000/products, health http://localhost:4000/health (phải có `"database":"up"`).
6. Dừng: `docker compose down` (giữ dữ liệu) hoặc `docker compose down -v` (xóa cả dữ liệu database).

Khách mẫu để thử đăng nhập: `khach01@brewlite.test`, mật khẩu xem [hướng dẫn database](backend/database/README.md). Chỉ dùng cho local.

## Test

```sh
npm test                      # unit/integration (PGlite trong bộ nhớ, không cần database ngoài)
npm run lint && npm run typecheck
npm i -D @playwright/test && npx playwright install chromium   # lần đầu, chỉ cho E2E
SEPAY_WEBHOOK_API_KEY=<giá trị trong .env> npx playwright test # E2E, cần stack Docker đang chạy
```

E2E dùng `docker compose -f docker-compose.yml -f docker-compose.e2e.yml up -d --build` để API nhận `SEPAY_WEBHOOK_API_KEY`. Chi tiết kịch bản: [docs/TV6_HUONG_DAN.md](docs/TV6_HUONG_DAN.md).

## Build

```sh
npm run build                                    # build backend và frontend
docker build -f backend/Dockerfile -t brewlite-api .
docker build -f frontend/Dockerfile -t brewlite-web .
```

`NEXT_PUBLIC_API_BASE_URL` được nhúng vào web lúc build, nên đổi URL API production phải build lại image web.

## Deploy production và rollback

Pipeline `.github/workflows/cd.yml`: push vào `main` hoặc tag `vX.Y.Z` → lint/test/build → build image gắn tag `sha-<commit>` hoặc semver → push GHCR → deploy lên VPS bằng `docker-compose.prod.yml` (migration có sao lưu DB trước) → `scripts/smoke.mjs` trên URL HTTPS thật → tự rollback nếu lỗi.

- Cấu hình VPS, secret và checklist nghiệm thu: [docs/deployment.md](docs/deployment.md).
- Smoke test thủ công: `SMOKE_API_URL=https://<api> SMOKE_WEB_URL=https://<web> node scripts/smoke.mjs`.
- **Rollback thủ công:** GitHub → Actions → **Rollback** → nhập tag cần quay về (bỏ trống = bản trước đó). Hoặc trên VPS: `sh deploy.sh rollback <tag>`.
- Rollback chỉ đổi code (image), không hoàn tác migration; migration chỉ thêm nên bản cũ vẫn chạy được. Cần khôi phục dữ liệu thì dùng bản sao lưu `backups/pre-<tag>.sql.gz` (xem docs/deployment.md, mục 5).
- Phát hành: `git tag -a v1.0.0 -m "BrewLite v1.0.0" && git push origin v1.0.0`, rồi tạo GitHub Release với [release notes](docs/release-notes-v1.0.0.md).

## Tài liệu cho nhóm

Backend tách rõ `routes/` → `controllers/` → `services/` → `models/`; xem [Vị trí viết logic và SQL](docs/VI_TRI_CODE.md).

- [Triển khai, bàn giao và rollback](docs/deployment.md)
- [Hướng dẫn phần TV6 (theo dõi đơn, E2E, CD)](docs/TV6_HUONG_DAN.md)
- [Phân công 6 thành viên](docs/PHAN_CONG.md)
- [Lưu ý từng module](docs/LUU_Y_MODULE.md)
- [Bản đồ file cần sửa](docs/VI_TRI_CODE.md)
- [Cấu trúc thư mục](docs/CAU_TRUC.md)
- [Quy ước code](docs/QUY_UOC.md)
- [Phạm vi bộ khung](docs/YEU_CAU_BO_KHUNG.md)
- [Database và phần cần bổ sung](backend/database/README.md)

## Lưu ý tiếp tục triển khai

Auth (đăng ký/đăng nhập, JWT, `JwtAuthGuard`) đã có. Để dùng chuyển khoản, cấu hình `NEXT_PUBLIC_VIETQR_BANK_ID`, `NEXT_PUBLIC_VIETQR_ACCOUNT_NO`, `NEXT_PUBLIC_VIETQR_ACCOUNT_NAME` trong `.env`, đồng thời cấu hình SePay gọi webhook `POST /webhooks/sepay` và đặt `SEPAY_WEBHOOK_API_KEY` khớp API key webhook. Nội dung chuyển khoản QR mới là `BREWLITE-ORDER-<UUID đơn>`; webhook kiểm tra mã đơn và số tiền từ database trước khi xác nhận. Mã QR cũ chỉ chứa UUID đầy đủ vẫn được chấp nhận. Đây là tích hợp demo; cần kiểm thử với tài khoản/test environment của nhà cung cấp trước khi thu tiền thật.
Phân công đã cân lại: TV1 làm sản phẩm + khuyến mãi + Docker local; TV2 làm giỏ + giao diện checkout; TV3 làm Auth/bảo mật + CI/required checks; TV4 làm backend đơn/tồn; TV5 làm thanh toán/điểm; TV6 làm theo dõi đơn + CD/production và ghép E2E. Những phần TODO chưa được coi là hoàn thành đề Assignment 2.
