# TV3: Tài khoản, bảo mật và CI (hướng dẫn và đối chiếu PHAN_CONG.md)


## 1. Đối chiếu với mục "Thành viên 3" của PHAN_CONG.md

| Yêu cầu | Trạng thái | Ở đâu / ghi chú |
|---|---|---|
| register, login, logout, verifyAccessToken, handleSessionExpired | Xong | `backend/src/services/auth.service.ts`, `frontend/src/features/auth/auth.service.ts` |
| Email unique (kể cả khác hoa thường), bcrypt, JWT | Xong | email chuẩn hóa chữ thường; unique index `lower(email)` của DB là nguồn sự thật, trùng trả 409 |
| 401 khi token thiếu/sai/hết hạn, kiểm tra ở API chứ không chỉ UI | Xong | `JwtAuthGuard`; mã `TOKEN_MISSING` / `TOKEN_INVALID` / `TOKEN_EXPIRED` |
| Không nhận role/userId tin cậy từ client | Xong | register chỉ đọc `email`, `password`; `userId` chỉ lấy từ JWT |
| Guard và cách lấy user hiện tại cho TV4/TV5/TV6 | Xong | `backend/src/guards/` (mục 4) |
| Không trả/log hash, mật khẩu, token | Xong | `passwordHash` chỉ có ở `UserRecord` nội bộ; log chỉ có thông điệp lỗi hạ tầng |
| Quay lại URL nội bộ, không mất giỏ, không open redirect | Xong | `frontend/src/features/auth/return-url.ts`; không đụng key localStorage của giỏ |
| npm ci, typecheck, lint, test, build trong CI | Viết xong, **chưa chạy trên GitHub** | `.github/workflows/ci.yml`, `eslint.config.mjs`, script `lint` ở `package.json` gốc |
| Test email trùng/khác hoa thường, sai mật khẩu, JWT hết hạn, API bảo vệ | Viết xong, **cần chạy `npm test` trên máy có thư viện thật** | `backend/test/auth.test.ts`, `auth.db.test.ts`, `menu.test.ts` |
| **Thống nhất cách lưu/gửi phiên với cả nhóm trước khi code** | **Chưa làm** | Tôi đã chọn JWT trong `localStorage`, gửi bằng `Authorization: Bearer`. Cần nhóm đồng ý (mục 8) |
| **Required checks / branch protection trên GitHub** | **Chưa làm, cần làm cùng chủ repo** | Mục 7 |
| **Minh chứng CI qua và CI phát hiện lỗi** | **Chưa làm** | Mục 7 |
| Phối hợp TV1 (.env trong Docker) và TV6 (secrets production) | Cần nhắn | Mục 5 và 10 |
| Không đổi transaction helper | Giữ nguyên | `config/db.ts` không bị sửa |

## 2. File dùng chung đã sửa (báo nhóm trước khi merge)

`backend/src/app.module.ts` (thêm provider), `backend/src/main.ts` (CORS nhiều origin, dừng sớm khi thiếu hoặc sai `JWT_SECRET`), `backend/src/config/environment.ts` (cấu hình JWT), `backend/test/menu.test.ts` (bỏ hai route auth khỏi danh sách 501, thêm test HTTP), `frontend/src/views/layouts/CustomerLayout.tsx` (**file của TV1**: nút "Đăng nhập" thành `<AccountNav />`), `.github/workflows/ci.yml`, `package.json` gốc, `.env_vidu`, và ba tài liệu đã lỗi thời vì Auth đã chạy: `README.md` (hai dòng nói Auth chưa làm), `backend/database/README.md` (dòng nói tài khoản mẫu chưa đăng nhập được), `docs/VI_TRI_CODE.md` (hàng Auth). Không sửa `types/contracts.ts`, `config/db.ts`, schema SQL, `scripts/database.ts`.

## 3. Đã làm gì

**Backend**: `models/user.model.ts`, `models/db-errors.ts`, `services/{auth,users,auth-validation}.ts`, `guards/{jwt-auth.guard,current-user.decorator}.ts`, `controllers/auth/auth.controller.ts` (`register` 201, `login` 200, `me` cần JWT), `routes/auth.routes.ts` (thêm `me`), `types/auth.types.ts`, `package.json` (thêm `bcryptjs`, `jsonwebtoken`, `@types/jsonwebtoken`), test như trên. `bcryptjs` phải khai báo ở backend vì ở gốc nó chỉ là devDependency (lock đánh dấu `dev`), image production sẽ thiếu nếu chỉ cài dependencies.

**Frontend**: `views/auth/` (LoginView, RegisterView, AuthField, auth.module.css, describe-error), `features/auth/` (`auth.service.ts` kèm `authorizedRequest`, `session.ts`, `useSession.ts`, `return-url.ts`, `validation.ts`, `AccountNav`), `types/auth.ts`, `lib/api-client.ts`. `lib/api.ts` có `server-only` nên trình duyệt không import được; vì vậy client chạy trong trình duyệt nằm ở `api-client.ts`.

**Gốc repo**: `package.json` (script `lint`; devDependencies `eslint`, `@eslint/js`, `typescript-eslint`, `globals`), `eslint.config.mjs`, `.github/workflows/ci.yml`, `.env_vidu`, tài liệu này.

## 4. Hợp đồng API và cách TV4/5/6 dùng guard

| Endpoint | Body | Thành công | Lỗi |
|---|---|---|---|
| `POST /auth/register` | `{ email, password }` | 201 `{ user }` | 400 `VALIDATION_FAILED` (+`errors`), 409 `EMAIL_TAKEN`, 503 |
| `POST /auth/login` | `{ email, password }` | 200 `{ accessToken, tokenType, expiresIn, user }` | 400, 401 `INVALID_CREDENTIALS`, 503 |
| `GET /auth/me` | header Bearer | 200 `{ user }` | 401 (3 mã token), 404, 503 |

`user = { id, email, displayName, loyaltyPoints }`. Mật khẩu 8 đến 72 byte, có chữ và số. 24 tài khoản seed `khach01@brewlite.test` đến `khach24@brewlite.test` đăng nhập được bằng `BrewLite123!`.

```ts
@Post(CUSTOMER_ROUTES.orders.create)
@UseGuards(JwtAuthGuard)
createOrder(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
  return this.orders.createOrder(user.id, body); // userId luôn lấy từ JWT, không tin userId trong body
}
```
Phía web gọi `authorizedRequest<T>(path, { method, body })` từ `@/features/auth/auth.service`: tự gắn token, gặp 401 thì xóa phiên và đưa về `/login?returnUrl=...`. Guard chỉ kiểm tra token, không truy vấn DB; TV4/5/6 vẫn phải kiểm tra chủ đơn.

## 5. Biến môi trường (`.env_vidu` đã được cập nhật)

`JWT_SECRET` (mẫu local, ≥ 32 ký tự), `JWT_EXPIRES_IN_SECONDS=3600`, `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` (URL API mà trình duyệt gọi, được nhúng vào bundle web lúc build; không bao giờ đặt secret vào biến `NEXT_PUBLIC_*`).

**Quan trọng về `JWT_SECRET`:** giá trị cũ trong `.env_vidu` (`replace_before_implementing_auth`) dài đúng 32 ký tự và là chuỗi công khai, nên nếu dùng nó thì ai cũng tự tạo được token hợp lệ. Backend giờ từ chối chuỗi cũ đó, từ chối giá trị mẫu local khi `NODE_ENV=production`, và in cảnh báo khi dùng giá trị mẫu local. **Ai đã có `.env` cũ phải lấy dòng `JWT_SECRET` mới từ `.env_vidu`, nếu không `npm run dev` sẽ dừng với thông báo nêu rõ cách sửa.** Production: tạo secret riêng bằng `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` và đặt `NODE_ENV=production` (TV6 cần đảm bảo biến này trong môi trường deploy; nếu thiếu, backend chỉ cảnh báo chứ không chặn).

Nhắn TV1: service api trong Compose cần `JWT_SECRET`, `DB_*`, `FRONTEND_ORIGIN`; service web cần `NEXT_PUBLIC_API_BASE_URL` lúc build.

## 6. Chạy và kiểm tra (tại gốc repo)

1. **`npm install` ở gốc repo (không chạy trong `backend/`), rồi commit `package-lock.json`.** Lock hiện chưa có `jsonwebtoken`, `@types/jsonwebtoken` và ESLint, nên `npm ci` (CI) sẽ báo lock lệch cho đến khi bước này xong. Kiểm lại bằng `npm ci`.
2. `npm run format` (prettier) để căn lại định dạng file mới theo cấu hình của nhóm.
3. `npm run typecheck && npm run lint && npm test && npm run build`.
4. Thử tay: `npm run db:migrate && npm run db:seed`, chạy `npm run dev`, vào `/login` đăng nhập `khach01@brewlite.test` / `BrewLite123!`; hoặc gọi `POST /auth/login` rồi `GET /auth/me` với header `Authorization: Bearer <accessToken>`.

## 7. CI, branch protection và minh chứng (cần làm trên GitHub)

Workflow **Check scaffold**, job **`check`**: báo tên này cho TV6. `ci.yml` chạy `npm ci`, `typecheck`, `lint`, `test`, `build` ở gốc (npm workspaces, một lock ở gốc); `npm run lint` chạy `eslint .` một lần cho cả hai thư mục bằng `eslint.config.mjs`.
1. Đẩy nhánh `tv3-auth-ci`, mở PR để workflow chạy ít nhất một lần.
2. Settings → Branches → Add branch protection rule, pattern `main`: bật *Require a pull request before merging*, bật *Require status checks to pass* và chọn `check`, bật *Require branches to be up to date*. Cần quyền admin nên làm cùng chủ repo. `ci.yml` cũng chạy khi push vào `scaffold/brewlite-customer`; nếu nhánh đó còn dùng thì áp quy tắc tương tự.
3. Minh chứng "CI qua": chụp PR có dấu tick xanh.
4. Minh chứng "CI phát hiện lỗi": tạo nhánh tạm, cố ý thêm `if (1 == 1) {}` (vi phạm `eqeqeq`) hoặc sửa một test cho sai, đẩy lên, chụp PR đỏ và nút Merge bị chặn, rồi đóng PR tạm.

## 8. Việc cần chốt với nhóm: cách lưu/gửi phiên

Đã chọn: JWT lưu `localStorage` (key `brewlite.session`), gửi bằng `Authorization: Bearer`. Lý do: backend đã bật CORS để trình duyệt gọi thẳng API, và TV2/TV5/TV6 chỉ cần gọi `authorizedRequest`. Rủi ro: script XSS đọc được token, nên không render HTML thô từ dữ liệu người dùng. Phương án thay thế là cookie httpOnly qua route handler của Next: an toàn hơn nhưng TV2/4/5/6 phải đổi cách gọi API. Hãy hỏi nhóm trước khi merge; đổi quyết định sẽ chủ yếu ảnh hưởng `session.ts` và `api-client.ts`.

## 9. Đã kiểm chứng và chưa

Sandbox không có mạng và không có PostgreSQL, nên không cài được NestJS, pg, bcryptjs, jsonwebtoken, PGlite thật.

**Đã kiểm chứng:**
- SQL của `UserModel` đối chiếu bằng cách đọc `001_schema.sql` thật: các cột, `NOT NULL`, `DEFAULT` và `CHECK` đều thỏa; unique index `lower(email)` có sẵn; trigger điểm thưởng không bị vi phạm khi tạo user với 0 điểm.
- Bằng bcrypt thật: mật khẩu `BrewLite123!` khớp hash seed, và hash bcrypt mới sinh ra khớp `CHECK password_hash` của schema.
- `tsc` strict với `backend/tsconfig.json` và `frontend/tsconfig.json` thật (chỉ thêm `ignoreDeprecations` vì sandbox dùng TypeScript 6.0, repo dùng 5.9.3), và build backend ra `dist` thành công.
- 13 test logic Auth với bản giả lập thư viện (có thử cố ý phá code để chắc test bắt được lỗi), test hàm thuần phía web, và form chạy trong Chromium thật với API giả (11 kịch bản, kể cả 360px).

**Cần bạn chạy:** `npm test` đầy đủ (nhất là `auth.db.test.ts` dùng PGlite, và test HTTP trong `menu.test.ts`), `npm run lint` (cấu hình ESLint chưa chạy thật; `no-unused-vars` và `no-explicit-any` để mức cảnh báo; nếu rule khác báo lỗi trên code của người khác, hạ nó xuống `warn`), `npm run format`, `npm run build` (Next.js thật), và mở `/login`, `/register` ở desktop và 360px.

## 10. Rủi ro và việc nên làm thêm

- Chưa có giới hạn số lần đăng nhập sai và chưa có refresh token (hết 1 giờ thì đăng nhập lại, giỏ vẫn giữ).
- Đăng ký trùng trả 409 (tiện cho người dùng nhưng cho biết email đã tồn tại); đăng nhập thì cố ý dùng một thông báo chung và luôn chạy bcrypt để thời gian phản hồi không lộ email.
- Validation viết tay thay vì `class-validator` (không có trong dependencies).
- `tests/e2e/checkout.spec.todo.ts` ghi TV3 sẽ ghép E2E vào CI sau; chưa làm vì các luồng đặt hàng và thanh toán chưa xong.
- Nhắn nhóm: TV2 chuyển người chưa đăng nhập sang `/login?returnUrl=/checkout` (hoặc dùng `authorizedRequest`); TV4/5/6 dùng `JwtAuthGuard` + `@CurrentUser()` rồi mới bỏ 501 của route mình.
