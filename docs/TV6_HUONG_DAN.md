# Hướng dẫn và bàn giao phần TV6 (theo dõi đơn, deploy, smoke)

## 1. Trạng thái phần TV6

| Việc                                                             | Trạng thái                                                                   | Nằm ở đâu                                                        |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| API đọc đơn của chính user (`GET /orders/me`, `GET /orders/:id`) | Xong, có guard JWT của TV3                                                   | `backend/src/controllers/customer/customer-orders.controller.ts` |
| Quy tắc chuyển trạng thái đơn (khớp trigger `002`)               | Xong, có test                                                                | `backend/src/services/order-state.service.ts`                    |
| Health check có kiểm tra DB (503 khi DB lỗi)                     | Xong                                                                         | `backend/src/controllers/system/health.controller.ts`            |
| Trang Đơn của tôi, Chi tiết đơn, Kết quả thanh toán              | Xong                                                                         | `frontend/src/views/customer/orders/`, `.../payment-status/`     |
| Frontend gửi token đăng nhập khi gọi `/orders/*`                 | Xong (đọc phiên của TV3)                                                     | `frontend/src/lib/client-api.ts`                                 |
| Smoke test sau deploy                                            | Xong                                                                         | `scripts/smoke.mjs`, chạy bằng `node scripts/smoke.mjs`          |
| Nút hủy đơn gọi API TV4                                          | Đã nối `POST /orders/:id/cancel`; cần E2E xác minh trên môi trường chạy thật | `OrderDetailView.tsx`                                            |
| E2E toàn luồng (menu → giỏ → đăng nhập → thanh toán → PAID) | Đã viết bằng Playwright, **chưa chạy được** trong môi trường soạn (không có Docker/mạng); cần chạy trên Docker thật | `tests/e2e/checkout.spec.ts`, `playwright.config.ts`, `.github/workflows/e2e.yml` |
| Workflow CD (image, registry, deploy, smoke, rollback) | Đã viết cho VPS + Docker Compose + GHCR; **chưa chạy thật** (chưa có VPS và secret) | `.github/workflows/cd.yml`, `rollback.yml`, `docker-compose.prod.yml`, `deploy/`, `docs/deployment.md` |

## 2. Smoke test sau deploy

Chỉ cần Node 22 trở lên, không cài thêm gói. Script chỉ đọc dữ liệu, không tạo hay sửa đơn.

```sh
SMOKE_API_URL=https://<api> SMOKE_WEB_URL=https://<web> node scripts/smoke.mjs
```

Trên Windows PowerShell:

```powershell
$env:SMOKE_API_URL="https://<api>"; $env:SMOKE_WEB_URL="https://<web>"; node scripts/smoke.mjs
```

Muốn kiểm tra thêm đăng nhập và đọc đơn, đặt thêm `SMOKE_EMAIL` và `SMOKE_PASSWORD` của một tài khoản thử riêng (không dùng tài khoản thật). Không để mật khẩu trong file hay commit.

Các bước kiểm tra: `/health` phải là `database: "up"` (sample mode bị coi là lỗi), `/products` có món, `/orders/me` không token hoặc token rác phải 401, trang web trả 200, và nếu có tài khoản thử thì đăng nhập, đọc `/orders/me` được 200, đơn không tồn tại trả 404. Script thoát mã 1 khi có bước lỗi nên CD dùng được để quyết định rollback.

Chạy thử local sau `npm run dev` (không đặt biến thì mặc định `localhost:4000` và `localhost:3000`): `node scripts/smoke.mjs`. Ở máy local mật khẩu mẫu của seed nằm trong `backend/database/README.md`.

## 3. Checklist deploy và rollback

Nền tảng đã chọn và hướng dẫn đầy đủ: [`docs/deployment.md`](deployment.md) (VPS, Docker Compose, Caddy, GHCR, GitHub Actions). Checklist chung bên dưới vẫn đúng với mọi nhà cung cấp.

Trước khi deploy:

1. CI xanh trên `main` (job `check`).
2. Có secret production riêng, không commit: `JWT_SECRET` (ngẫu nhiên, 32 ký tự trở lên, không chứa `local_only` hay `replace_`), `DB_PASSWORD`, `DB_USER`, `DB_NAME`, `DB_HOST`, `FRONTEND_ORIGIN` (đúng URL web production, không dùng `*`).
3. Khi build web, đặt `NEXT_PUBLIC_API_BASE_URL` là URL API công khai. Biến này được nhúng vào bundle lúc build, nên đổi URL phải build lại web. Không đặt secret vào biến `NEXT_PUBLIC_*`.
4. Chạy migration trước khi chuyển lưu lượng: `npm run db:migrate`. Không sửa đè `001` và `002` đã áp dụng; thay đổi schema dùng migration mới từ `004`.
5. Dùng HTTPS cho cả web và API (token đăng nhập gửi qua header `Authorization`).

Sau deploy: chạy smoke test ở mục 2. Có bước lỗi thì rollback.

Rollback: giữ lại image và tag của bản chạy tốt trước đó, khi lỗi thì triển khai lại tag cũ rồi chạy smoke lần nữa. Migration chỉ thêm (không xóa cột hay bảng đang dùng) thì bản code cũ vẫn chạy được với DB mới. Nếu migration có thay đổi phá vỡ, cần sao lưu DB trước khi deploy.

Khi nhóm chốt hosting, workflow CD nên có thứ tự: build image từ Docker của TV1, đẩy lên registry, deploy, chạy `node scripts/smoke.mjs`, và tự rollback nếu smoke lỗi. Chỉ chọn nhà cung cấp và điền secret khi cả nhóm đã thống nhất.

## 4. Điểm cần báo TV1, TV3, TV5 (đọc từ code, chưa chạy Docker để xác nhận)

- `docker-compose.yml` hiện đã truyền `JWT_SECRET` cho `api` (mục cũ về việc thiếu biến này đã được TV1 xử lý). Khi chạy Docker local vẫn cần `JWT_SECRET` riêng, không chứa `local_only`, vì image `api` đặt `NODE_ENV=production`.
- `frontend/Dockerfile` chưa khai báo `ARG NEXT_PUBLIC_API_BASE_URL`, nên image web production sẽ gọi `http://localhost:4000`. TV1 thêm 2 dòng `ARG`/`ENV` (xem `docs/deployment.md`, mục 3). CD đã truyền build-arg sẵn.
- `docker-compose.yml` chưa truyền `SEPAY_WEBHOOK_API_KEY` cho `api` nên webhook trong container luôn 401. TV1 thêm biến này; E2E tạm dùng `docker-compose.e2e.yml`.
- `.env_vidu` có `NEXT_PUBLIC_SEPAY_WEBHOOK_API_KEY`: biến `NEXT_PUBLIC_*` bị nhúng vào trình duyệt, không được điền khóa thật.
- Seed tạo 24 tài khoản demo cùng mật khẩu `BrewLite123!`; trên production cần đổi mật khẩu hoặc vô hiệu các tài khoản này.
- `PaymentView` (TV5): cổng mô phỏng `MockPaymentGateway` trả kết quả ngẫu nhiên (khoảng 80% thành công, 10% thất bại, 10% timeout), nên E2E dùng webhook SePay để có kết quả cố định.

## 5. Kiểm tra quyền sở hữu và chuyển trạng thái

Đã có test trong `backend/test/customer-orders.test.ts` và `customer-orders.sql.test.ts` (quy tắc trạng thái, đọc đơn theo user, SQL thật trên PGlite). Chạy bằng `npm test` ở thư mục gốc.

## 6. Trang kết quả thanh toán với luồng SePay

Hiện thanh toán thật chỉ có webhook SePay (`POST /webhooks/sepay`): khi tiền về, backend tạo payment `SUCCEEDED`, đổi đơn sang `PAID` và ghi điểm trong một transaction. Trước lúc đó đơn vẫn `PENDING` và chưa có dòng payment nào, nên trang `/payment-status` coi đó là "đang chờ" và tiếp tục polling `GET /orders/:id` (tối đa 60 giây, 2 giây một lần) thay vì báo ngay "chưa thanh toán". Hết 60 giây thì hiện nút "Kiểm tra lại"; không tự kết luận thất bại.

Thử local khi chưa có trang `/payment` của TV5: tạo đơn qua giao diện, mở `/payment-status?orderId=<mã đơn đầy đủ>`, rồi ở terminal khác chạy:

```sh
SEPAY_WEBHOOK_API_KEY=<giá trị trong .env của API> node scripts/simulate-sepay.mjs <mã đơn đầy đủ> <tổng tiền>
```

Tổng tiền phải đúng bằng tổng đơn, nếu không webhook trả 400. Script chỉ chạy với API trên localhost.

## 7. Kiểm tra lỗi "tự hủy đơn khi thanh toán thành công / xem đơn"

Kiểm tra bằng đọc code (không chạy được hệ thống), phần TV6 và các điểm liên quan để báo TV4:

- **Frontend (TV6):** `cancelOrder` chỉ được gọi trong `confirmCancel` của `OrderDetailView.tsx`, sau khi khách bấm "Hủy đơn" rồi "Xác nhận hủy". Trang `/payment-status` và `/orders/[id]` khi tải chỉ gọi `GET /orders/:id`; polling chỉ gọi thêm `POST /payments/:id/reconcile` khi lần thanh toán mới nhất đang `PROCESSING`. Không có đường nào gọi `/cancel` ngầm.
- **Xóa giỏ:** `PaymentStatusView` chỉ xóa giỏ khi backend xác nhận đơn đã trả tiền. Đã sửa để mỗi mã đơn chỉ xóa giỏ **một lần** (ghi nhớ ở `localStorage`, khóa `brewlite.cleared-orders`), tránh xóa nhầm giỏ mới khi khách mở lại trang kết quả của đơn cũ.
- **Backend (đọc để báo TV4, không sửa):** mọi `UPDATE orders` đều có `WHERE id = $1` (không có câu lệnh hủy theo `user_id`). `finalizePayment` và webhook SePay chỉ đổi đúng `orderId` được thanh toán. `findExpiredPendingOrders` chỉ lấy đơn `PENDING` có `expires_at < now()` và không có thanh toán `PROCESSING`; `expires_at` mặc định `now() + 15 phút` (`TIMESTAMPTZ`, không lệch múi giờ).
- **Khác với đề bài:** đề nói `OrderExpiryJob` chạy mỗi 5 giây, nhưng trong code nhận được `INTERVAL_MS = 60_000` (60 giây). Nếu bản của TV4 đã đổi, cần đối chiếu lại.
- **Chưa xác nhận được nguyên nhân gốc:** chưa tái hiện được lỗi vì không chạy được hệ thống. Nếu lỗi vẫn xảy ra, kiểm tra theo thứ tự: trạng thái đơn trong DB trước/sau khi xem, `expires_at` của đơn bị hủy (có phải đã quá 15 phút không), và log của `OrderExpiryJob`. Test E2E "Nhiều đơn PENDING độc lập" trong `tests/e2e/checkout.spec.ts` tái hiện đúng kịch bản của báo lỗi.

## 8. E2E (Playwright)

Chạy trên Docker, xem `docs/deployment.md` mục 8. Gồm 4 test: luồng đầy đủ đến PAID (tiền về qua webhook SePay để kết quả cố định), thanh toán mô phỏng (chấp nhận mọi kết quả hợp lệ, không bị hủy nhầm), một đơn PAID không đổi đơn PENDING khác, và (tùy chọn, `E2E_WAIT_EXPIRY_JOB=1`) job hết hạn không hủy đơn chưa hết hạn. Chưa có `data-testid` từ TV2 nên selector dùng role/nhãn/`href`; đổi chữ trên giao diện có thể làm test hỏng và cần cập nhật theo.
