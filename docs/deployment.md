# Triển khai production, bàn giao và rollback (TV6)

Nền tảng thực tế: **một VPS Linux chạy Docker Compose**, HTTPS bằng **Caddy**, image lưu ở **GitHub Container Registry (GHCR)**, CI/CD bằng **GitHub Actions**.
Sơ đồ: [`diagrams/deployment.svg`](diagrams/deployment.svg) (nguồn `diagrams/deployment.dot`, ảnh `diagrams/deployment.png`).

> Trạng thái thật: các file CD, compose production và `deploy.sh` đã được viết và kiểm tra cú pháp (YAML, `sh -n`), **chưa chạy trên VPS thật** vì chưa có máy chủ và secret. Chỉ được ghi "đã deploy" vào báo cáo sau khi `scripts/smoke.mjs` đạt trên URL HTTPS thật.

## 1. Truy vết thành phần trong sơ đồ

| Thành phần trong sơ đồ            | Mô tả kiến trúc / mã nguồn                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| Trình duyệt / PWA                 | `frontend/` (Next.js), giỏ và phiên đăng nhập ở localStorage                                |
| caddy (80, 443)                   | `docker-compose.prod.yml`, `deploy/Caddyfile`                                               |
| brewlite-web (3000, nội bộ)       | `frontend/Dockerfile`                                                                       |
| brewlite-api (4000, nội bộ)       | `backend/Dockerfile`, `GET /health` ở `backend/src/controllers/system/health.controller.ts` |
| postgres + volume `brewlite_data` | `docker-compose.prod.yml`; schema/migration ở `backend/database/`                           |
| brewlite-migrate (job)            | stage `builder` của `backend/Dockerfile`, lệnh `npm run db:migrate -w backend`              |
| GitHub Actions + GHCR             | `.github/workflows/ci.yml` (TV3), `cd.yml`, `rollback.yml` (TV6)                            |
| Smoke test                        | `scripts/smoke.mjs`                                                                         |
| Deploy/rollback trên VPS          | `deploy/deploy.sh`                                                                          |
| Local                             | `docker-compose.yml` (TV1), chỉ bind `127.0.0.1`                                            |

Ranh giới: **Local** (máy dev, secret mẫu từ `.env_vidu`) → **CI** (runner GitHub, chạy test và build image, secret chỉ có trong GitHub Secrets) → **Production** (VPS, secret ở `.env.prod` trên máy chủ). Chỉ Caddy mở cổng ra internet; db, api, web không publish cổng.

## 2. Chuẩn bị một lần

**VPS** (Ubuntu, Docker Engine + plugin Compose):

1. Trỏ DNS bản ghi A của `WEB_DOMAIN` và `API_DOMAIN` về IP VPS (có thể dùng tên miền miễn phí như DuckDNS).
2. Firewall chỉ mở 22, 80, 443: `ufw allow 22,80,443/tcp && ufw enable`. **Không mở 5432.**
3. Tạo thư mục triển khai (ví dụ `/opt/brewlite`) và file `.env.prod` theo mẫu `deploy/env.prod.example`. Quyền `chmod 600 .env.prod`. Không commit file này.
4. Tạo cặp khóa SSH riêng cho CD, đưa public key vào `~/.ssh/authorized_keys` của user deploy (user thuộc nhóm `docker`).

**GitHub** (Settings → Secrets and variables → Actions; tạo Environment `production`):

| Loại     | Tên                  | Giá trị                                                    |
| -------- | -------------------- | ---------------------------------------------------------- |
| Secret   | `DEPLOY_HOST`        | IP hoặc tên miền VPS                                       |
| Secret   | `DEPLOY_USER`        | user SSH                                                   |
| Secret   | `DEPLOY_SSH_KEY`     | private key dành riêng cho CD                              |
| Secret   | `DEPLOY_KNOWN_HOSTS` | kết quả `ssh-keyscan -H <host>` (ghim khóa máy chủ)        |
| Secret   | `DEPLOY_PATH`        | thư mục trên VPS, ví dụ `/opt/brewlite`                    |
| Secret   | `SMOKE_EMAIL`, `SMOKE_PASSWORD` | tài khoản thử riêng (tùy chọn)                  |
| Variable | `PUBLIC_API_URL`     | `https://<API_DOMAIN>`                                     |
| Variable | `PUBLIC_WEB_URL`     | `https://<WEB_DOMAIN>`                                     |

Workflow CD dùng `GITHUB_TOKEN` để đẩy image lên GHCR và truyền token qua stdin để VPS `docker login` khi pull. Không có secret nào nằm trong repo hay in ra log.

## 3. Việc cần TV1 và TV3 (không nằm trong file của TV6)

1. **`frontend/Dockerfile` (TV1):** `NEXT_PUBLIC_API_BASE_URL` được nhúng vào bundle lúc build, nhưng Dockerfile chưa khai báo `ARG`, nên image production sẽ gọi nhầm `http://localhost:4000`. Thêm hai dòng ngay sau `FROM dependencies AS builder`:
   ```dockerfile
   ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
   ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
   ```
   Giá trị mặc định giữ nguyên hành vi của `docker compose` local.
2. **`docker-compose.yml` (TV1):** service `api` chưa truyền `SEPAY_WEBHOOK_API_KEY`, nên webhook luôn 401 trong container. Thêm `SEPAY_WEBHOOK_API_KEY: ${SEPAY_WEBHOOK_API_KEY:-}` vào `environment` của `api`. (Trong lúc chờ, E2E dùng `docker-compose.e2e.yml` để truyền biến này.)
3. **`.env_vidu` (TV3/TV5):** có biến `NEXT_PUBLIC_SEPAY_WEBHOOK_API_KEY`. Mọi biến `NEXT_PUBLIC_*` bị nhúng vào trình duyệt, nên không bao giờ được điền khóa thật vào đó (đã có ghi chú ở `docs/TV3_HUONG_DAN.md`).
4. **Tài khoản demo:** `002_seed.sql` tạo 24 khách mẫu (`khachNN@brewlite.test`) cùng mật khẩu `BrewLite123!`. Seed là bắt buộc cho lần deploy đầu (có menu để smoke test), nhưng trên production cần đổi mật khẩu hoặc vô hiệu các tài khoản này. Mình chưa kiểm chứng cách xóa an toàn vì có ràng buộc trigger với đơn và điểm thưởng.

## 4. Deploy

Tự động: push vào `main` hoặc tạo tag `vX.Y.Z` → `cd.yml` chạy:

1. **quality**: `npm ci` → typecheck → lint → test → build (cùng bước với `ci.yml`).
2. **images**: build và push `brewlite-api`, `brewlite-web`, `brewlite-migrate` lên GHCR với tag `sha-<7 ký tự>` (và semver khi là tag `v*`).
3. **deploy**: gửi `docker-compose.prod.yml`, `Caddyfile`, `deploy.sh` lên VPS rồi chạy `deploy.sh deploy <tag>`: pull image → `pg_dump` sao lưu (`backups/`) → migrate → đổi api/web → chờ `/health`. Health lỗi thì tự quay về bản trước.
4. **smoke**: `scripts/smoke.mjs` trên URL HTTPS thật (`/health` phải `database: "up"`).
5. **rollback**: nếu smoke lỗi, quay về bản trước, smoke lại, mở issue cảnh báo và đánh dấu pipeline thất bại.

**Lần deploy đầu tiên** (DB trống): sau khi `deploy.sh deploy` chạy xong migrate, chạy seed một lần trên VPS rồi migrate lại để áp dụng migration catalog:

```sh
cd /opt/brewlite
export IMAGE_TAG=$(cat .state/current_tag)
docker compose --env-file .env.prod -f docker-compose.prod.yml --profile tools run --rm migrate npm run db:seed -w backend
docker compose --env-file .env.prod -f docker-compose.prod.yml --profile tools run --rm migrate
```

Migration phải **chỉ thêm** (bảng/cột mới, không xóa thứ bản cũ đang dùng) để rollback code vẫn chạy được với DB mới; schema đã áp dụng không sửa đè (`001`, `002`), dùng file mới từ `007_...sql` trở đi.

## 5. Rollback

- **Tự động:** xem mục 4 (health lỗi trên VPS hoặc smoke lỗi trên URL thật).
- **Thủ công:** GitHub → Actions → **Rollback** → Run workflow, nhập tag (ví dụ `sha-1a2b3c4` hoặc `1.0.0`); bỏ trống để quay về bản trước (`.state/previous_tag`). Hoặc trên VPS: `sh deploy.sh rollback <tag>`.
- **Chỉ đổi code (image), không hoàn tác DB.** Nếu một migration làm hỏng dữ liệu, khôi phục từ bản sao lưu trước deploy đó:
  ```sh
  gunzip -c backups/pre-<tag>.sql.gz | docker compose --env-file .env.prod -f docker-compose.prod.yml exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
  ```
  (cần dừng api/web trước và tạo lại database trống; nên thử trên bản sao trước.)

## 6. Release v1.0.0

Sau khi smoke đạt trên production:

```sh
git checkout main && git pull
git tag -a v1.0.0 -m "BrewLite v1.0.0"
git push origin v1.0.0
```

Tag kích hoạt `cd.yml` (image gắn thêm tag `1.0.0`). Trên GitHub → Releases → Draft a new release → chọn tag `v1.0.0` → dán release notes: tính năng (menu, giỏ, đăng nhập JWT, đặt đơn, thanh toán Ví/Thẻ mô phỏng và chuyển khoản SePay, lịch sử/trạng thái đơn), cách chạy local bằng Docker, URL production, các giới hạn đã biết.

## 7. Checklist nghiệm thu (người ngoài nhóm tự kiểm tra)

- [ ] `https://<WEB_DOMAIN>` mở được, chứng chỉ HTTPS hợp lệ.
- [ ] `https://<API_DOMAIN>/health` trả `{"status":"ok","dataSource":"postgres","database":"up"}`.
- [ ] Từ máy ngoài, `nc -zv <IP VPS> 5432` **không** kết nối được (DB không public).
- [ ] `node scripts/smoke.mjs` với `SMOKE_API_URL`, `SMOKE_WEB_URL` đạt toàn bộ bước.
- [ ] Repository và log CI không chứa `JWT_SECRET`, mật khẩu DB, khóa SePay hay khóa SSH.
- [ ] Có tag `v1.0.0`, release notes và `README.md` hướng dẫn chạy local, test, build, deploy, rollback.
- [ ] Video/demo luồng menu → giỏ → đăng nhập → đặt đơn → thanh toán → PAID trên URL production.

## 8. Chạy local và E2E bằng Docker

```sh
cp .env_vidu .env              # Windows: copy .env_vidu .env; đặt JWT_SECRET riêng (không chứa local_only)
docker compose up -d --wait db
npm ci && npm run db:migrate && npm run db:seed && npm run db:migrate
docker compose -f docker-compose.yml -f docker-compose.e2e.yml up -d --build
npm i -D @playwright/test && npx playwright install chromium
SEPAY_WEBHOOK_API_KEY=<giá trị trong .env> npx playwright test
```

`npm run lint` cũng quét `tests/e2e` và `playwright.config.ts`, nên cần cài `@playwright/test` và commit `package.json`, `package-lock.json` cùng lúc.
