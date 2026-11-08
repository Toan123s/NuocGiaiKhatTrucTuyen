# BrewLite v1.0.0

Bản phát hành đầu tiên của BrewLite (môn Công nghệ phần mềm, Assignment 2).

## Địa chỉ

- Web: `<điền URL HTTPS của web>`
- API: `<điền URL HTTPS của API>` · health: `<URL API>/health`
- Mã nguồn: `<điền link repository>`

(Điền sau khi `scripts/smoke.mjs` đạt trên URL production.)

## Tính năng

- Xem menu (tìm kiếm, lọc theo nhóm), chi tiết món, chọn size và topping.
- Giỏ hàng gộp món theo size/topping, số lượng 1–99, giữ giỏ khi tải lại; chỉ xóa sau khi đơn PAID.
- Đăng ký, đăng nhập, JWT; quên và đặt lại mật khẩu.
- Mã khuyến mãi (xem trước ở giao diện, backend tính lại khi tạo đơn).
- Tạo đơn: giữ tồn trong cùng transaction, đơn tự hủy sau 15 phút nếu chưa thanh toán.
- Thanh toán Ví/Thẻ mô phỏng (có Idempotency-Key) và chuyển khoản VietQR/SePay (webhook), tích điểm thưởng đúng một lần.
- Lịch sử đơn, chi tiết đơn, trang kết quả thanh toán (polling), hủy đơn.

## Hạ tầng và quy trình

- Next.js, NestJS, PostgreSQL, đóng gói bằng Docker; chạy local bằng `docker compose up --build`.
- CI: install → typecheck → lint → test → build. CD: build image, push GHCR, deploy VPS, smoke test, tự rollback.
- Kiểm thử: unit/integration (PGlite) và E2E Playwright.

## Cách chạy và rollback

Xem [README.md](../README.md) (chạy local, test, build) và [docs/deployment.md](deployment.md) (deploy, rollback).

## Giới hạn đã biết

- Cổng thanh toán Ví/Thẻ là mô phỏng, kết quả ngẫu nhiên; SePay là tích hợp demo, cần thử với môi trường test của nhà cung cấp trước khi thu tiền thật.
- Chưa có giao diện quản trị/nhân viên.
- Seed có tài khoản demo dùng chung một mật khẩu; chỉ dùng để thử, cần đổi hoặc vô hiệu trên production.
- Rollback chỉ đổi image, không hoàn tác migration.
