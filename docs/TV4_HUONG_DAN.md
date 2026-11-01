# Hướng dẫn phần TV4: Đơn hàng và tồn kho

BrewLite · Phần TV4 (backend đơn hàng và tồn kho) · Cập nhật 31/10/2026 · Nhánh làm việc: Toan

## 1. Tóm tắt

Phần TV4 là backend của đơn hàng và tồn kho: tạo đơn, hủy đơn, xem giá tạm, giữ và hoàn tồn kho (kể cả tồn kho nguyên liệu), và job tự hủy đơn quá hạn 15 phút. Phần này không có giao diện.

Backend đi theo tầng: routes (URL) → controllers (nhận request) → services (nghiệp vụ, transaction, ném exception) → models (SQL tham số hóa). Model không tự mở transaction mà nhận `PoolClient` từ service; `DatabaseService.withTransaction` tự BEGIN, COMMIT, ROLLBACK.

Trong code, những chỗ đang chờ quyết định hoặc chờ người khác được ghi chú bằng tiền tố `LƯU Ý TV4` (tìm bằng Ctrl + Shift + F).

## 2. Trạng thái từng nhiệm vụ

Cách đọc nhãn trạng thái:

- **HOÀN THIỆN**: phần TV4 làm xong và có test đang chạy.
- **CHỜ NỐI**: phần TV4 viết xong và có test, nhưng chưa dùng được thật vì còn thiếu bước của người khác (đăng ký, route, người gọi).
- **ĐỀ XUẤT**: mới là phương án của TV4, chưa được người liên quan chốt.

| # | Nhiệm vụ | File (trong `backend/src`) | Trạng thái | Phụ thuộc |
|---|---|---|---|---|
| 1 | Kiểu dữ liệu đơn hàng | `types/order.types.ts` | HOÀN THIỆN | Không |
| 2 | `OrderModel` (9 hàm SQL) | `models/order.model.ts` | HOÀN THIỆN, test PGlite | Không |
| 3 | `InventoryModel`: `decreaseStock`, `restoreStockOnce`, `findStock` | `models/inventory.model.ts` | HOÀN THIỆN | Không |
| 4 | `InventoryService`: `reserveStock`, `releaseStock` | `services/inventory.service.ts` | HOÀN THIỆN | Giới hạn của `reserveIngredients` (xem mục 8) |
| 5 | Tính đơn giá từ DB | `services/order-pricing.ts` | HOÀN THIỆN | Không |
| 6 | `createOrder` | `services/orders.service.ts` | HOÀN THIỆN | Khuyến mãi dùng `PromotionsService` của TV1 |
| 7 | `cancelOrder` | `services/orders.service.ts` | HOÀN THIỆN | Không |
| 8 | Controller đặt và hủy đơn (`POST /orders`, `POST /orders/:id/cancel`) | `controllers/customer/orders.controller.ts` | HOÀN THIỆN, test qua HTTP | Dùng `JwtAuthGuard` của TV3 |
| 9 | `expirePendingOrders` (hàm hủy đơn quá hạn) | `services/orders.service.ts` | HOÀN THIỆN | Không |
| 10 | `OrderExpiryJob` (chạy hàm trên mỗi 60 giây) | `services/OrderExpiryJob.ts` | **CHỜ NỐI** | Cả nhóm: thêm vào `providers` của `app.module.ts` (file chung) |
| 11 | `preparePaymentRetry` (thanh toán lại) | `services/orders.service.ts` | **CHỜ NỐI** | TV5: chưa có route, chưa có ai gọi hàm này |
| 12 | `previewOrder` (xem giá tạm) | `services/orders.service.ts` | **CHỜ NỐI**, request/response là **ĐỀ XUẤT** | TV2 và TV1 chốt request/response; thêm route vào `routes/customer.routes.ts` (file chung) |
| 13 | Bộ test của TV4 | `backend/test` | HOÀN THIỆN | Không |

Những việc còn thiếu nằm hết ở nhóm "CHỜ NỐI". Cụ thể hôm nay:

- Job hủy đơn quá hạn **chưa chạy** vì `OrderExpiryJob` chưa được đăng ký trong `app.module.ts`. Hậu quả: đơn bỏ dở vẫn giữ tồn kho cho tới khi có người hủy tay.
- `previewOrder` và `preparePaymentRetry` chưa có route nên chưa gọi được từ bên ngoài.

Chưa kiểm chứng được:

- Luồng đặt đơn qua giao diện web thật (phụ thuộc phần giao diện của TV2 và đăng nhập phía web của TV3).
- Tranh tồn kho giữa nhiều kết nối thật cùng lúc: test dùng PGlite chỉ có một kết nối, cần PostgreSQL server thật.

Kết quả kiểm tra tại thời điểm viết (31/10/2026): lint 0 error, `tsc` sạch, mọi test của TV4 pass, có 1 test `todo` (mục 8), test fail duy nhất của cả bộ là `menu.test.ts` của TV1.

## 3. Phần không thuộc TV4 nhưng TV4 dùng

| Thành phần | Của ai | TV4 dùng để |
|---|---|---|
| `PromotionsService`, `PromotionModel` | TV1 | Kiểm tra và tính giảm giá cho đơn |
| `InventoryModel.reserveIngredients` | Người khác thêm (nhóm nguyên liệu) | Giữ nguyên liệu khi đặt đơn |
| `JwtAuthGuard`, `CurrentUser` | TV3 | Bảo vệ route và lấy người dùng hiện tại |
| `CustomerOrdersController` (xem đơn của tôi) | TV6 | Dùng chung đường dẫn gốc `orders`, khác route |
| Thanh toán (`payments`, `sepay`) | TV5 | Gọi `preparePaymentRetry` và `releaseStock` |

## 4. API

Cả hai route đều cần JWT (`Authorization: Bearer <token>`); thiếu hoặc sai token trả 401.

### POST /orders

Body (kiểu `CreateOrderInput`):

```json
{
  "items": [
    { "productId": "ca-phe-sua", "size": "M", "toppingIds": ["cream"], "quantity": 2 }
  ],
  "promotionCode": "WELCOME10"
}
```

`promotionCode` là tùy chọn. Mã có dấu cách hoặc chữ thường được chuẩn hóa trước khi kiểm tra. Giá luôn được tính lại từ DB, không tin giá client gửi lên.

Thành công (201): `{ orderId, status, subtotal, discount, total }`, trạng thái đầu là `PENDING`.

| Mã | Khi nào |
|---|---|
| 400 | `items` thiếu, rỗng hoặc có dòng không hợp lệ; `quantity` không phải số nguyên từ 1 đến 99; mã giảm giá không phải chuỗi, không tồn tại hoặc hết hiệu lực; sản phẩm, size hoặc topping không hợp lệ |
| 401 | Thiếu hoặc sai token |
| 409 | Hết tồn kho hoặc hết nguyên liệu; món chưa có công thức nguyên liệu |

### POST /orders/:id/cancel

Không có body. Thành công (201): `{ orderId, status: "CANCELLED" }`.

| Mã | Khi nào |
|---|---|
| 401 | Thiếu hoặc sai token |
| 404 | Đơn không tồn tại hoặc không thuộc người dùng trong token |
| 409 | Đơn không ở trạng thái `PENDING` hoặc `PAYMENT_FAILED`; đang có thanh toán xử lý; hủy lại đơn đã hủy |

### Chưa có route (CHỜ NỐI)

- `previewOrder(input)`: xem giá tạm, tính giống hệt `createOrder` nhưng không ghi DB và không giữ tồn (hết hàng vẫn xem được giá). Request dùng `CreateOrderInput`. Response **đề xuất**: `{ items: [{ productId, productName, size, toppingIds, quantity, unitPrice, lineTotal }], subtotal, discount, total }`.
- `preparePaymentRetry(userId, orderId)`: đưa đơn `PAYMENT_FAILED` về `PENDING` và giữ lại tồn.

## 5. Luồng nghiệp vụ

### Tạo đơn

Tất cả chạy trong một transaction; lỗi ở bước nào cũng rollback toàn bộ.

1. Kiểm tra đầu vào (dùng chung với `previewOrder`).
2. Tính giá từ DB (`priceOrder`): giá món, phụ phí size, giá topping; áp mã khuyến mãi qua `PromotionsService`.
3. `insertOrder`, rồi `insertOrderItems`.
4. `reserveStock(items, client, orderId)`.

Thứ tự bước 3 và 4 là bắt buộc: bảng giữ nguyên liệu có khóa ngoại tới `orders`, nên đơn phải tồn tại trước khi giữ nguyên liệu. Đảo thứ tự từng làm hỏng toàn bộ việc đặt đơn trên DB có migration 005.

### Hủy đơn

`findForUpdate` khóa dòng đơn, kiểm tra chủ đơn (người lạ nhận 404), trạng thái và việc đang có thanh toán xử lý. Sau đó `updateStatus` theo kiểu compare-and-set sang `CANCELLED`, rồi `releaseStock` **trong cùng transaction**.

### Hết hạn giữ tồn

`OrderExpiryJob` chạy mỗi 60 giây và gọi `expirePendingOrders`: tìm đơn `PENDING` quá hạn (mặc định 15 phút), mỗi đơn xử lý trong một transaction riêng, bỏ qua đơn đang có thanh toán xử lý. Lỗi của một đơn không ảnh hưởng các đơn khác. Job bỏ qua chế độ sample.

### Thử lại thanh toán

`preparePaymentRetry` chỉ nhận đơn `PAYMENT_FAILED` của chủ đơn. Nó giữ tồn **trước** (hết hàng thì rollback và đơn vẫn `PAYMENT_FAILED`), rồi mới đưa đơn về `PENDING`. Phải truyền `orderId` vào `reserveStock` để nguyên liệu được giữ lại.

## 6. Tồn kho

Có hai đường, chọn tự động:

- **Tồn kho nguyên liệu** (migration 005 và 006): khi bảng công thức tồn tại và có `orderId`, đơn trừ nguyên liệu theo công thức. Size M nhân 1,25 và size L nhân 1,5 (làm tròn lên); topping trân châu 50 g, kem sữa 30 g; tồn đầu mỗi nguyên liệu là 5.000. Nguyên liệu được giữ theo đơn trong bảng `order_ingredient_reservations`.
- **Tồn kho cũ** (`products.stock`): dùng khi chưa có bảng nguyên liệu.

Cơ chế chung:

- Hoàn tồn đúng một lần nhờ cờ `stock_released` của đơn.
- Khóa lạc quan bằng cột `version` (của `products` và `ingredients`).
- Hết hàng hoặc tranh tồn thì ném lỗi, transaction rollback.

## 7. Quy tắc DB (trigger 002)

- Đơn `CANCELLED` hoặc `PAYMENT_FAILED` phải có `stock_released = true` lúc COMMIT, nên đổi trạng thái và hoàn tồn nằm cùng transaction. Đơn `PAID` trở đi phải có `stock_released = false`.
- Chi tiết đơn chỉ ghi trong transaction tạo đơn và trước khi có payment. Đơn cần ít nhất một dòng và `subtotal` bằng tổng các dòng.
- `discount` lớn hơn 0 thì bắt buộc có `promotion_id`. `total = subtotal - discount`.
- Hạn giữ tồn mặc định 15 phút.

## 8. Việc đang chờ người khác và điểm cần quyết định

| Việc | Ai | Ghi chú |
|---|---|---|
| Đăng ký `OrderExpiryJob` trong `providers` của `app.module.ts` | Cả nhóm (file chung) | Đã kiểm tra: hiện không file nào nhắc tới job ngoài chính nó. Job đã sửa lỗi inject, chỉ còn thiếu dòng đăng ký |
| Chốt request/response `previewOrder` và thêm route | TV2, TV1 | Route thêm vào `routes/customer.routes.ts` (file chung) |
| Gọi `preparePaymentRetry`; khi thanh toán thất bại phải đổi `PAYMENT_FAILED` và gọi `releaseStock` trong cùng một transaction | TV5 | Trigger 002 đòi `stock_released = true` lúc COMMIT |
| Vá `reserveIngredients` cho món thiếu công thức | Người giữ file này, TV1 | Xem ghi chú bên dưới bảng |
| Sửa `menu.test.ts` | TV1 | Dòng `/orders` đang đòi 501 nhưng giờ trả 401; dòng `/products/abc` đòi 501 trong khi test khác cùng file đòi 404 |
| `CustomerOrdersController` chưa gắn `UseGuards` | TV6 | Đã kiểm tra trong code: file còn comment "TV3 TODO", chưa có `@UseGuards` |

Các mục sau lấy từ lần kiểm tra của TV4 ngày 31/10/2026, chưa kiểm lại với code mới nhất của từng người:

| Việc | Ai | Ghi chú |
|---|---|---|
| `getAccessToken` ở `client-api.ts` còn trả `null` | TV3 | Web gọi API luôn bị 401 |
| Webhook SePay chỉ chốt `PAID` khi đơn còn `PENDING` | TV5, TV6 | Khách chuyển khoản sau khi đơn bị hủy quá 15 phút thì tiền vào nhưng đơn không `PAID` |
| Migration 006 lỗi trên DB mới | TV1, TV3, người viết 006 | Khóa ngoại tới `products` trong khi seed chạy sau migrate; ảnh hưởng clone mới, Docker, deploy |

**Món thiếu công thức.** Theo tài liệu trạng thái, 4 món matcha (`matcha-dau`, `matcha-dua`, `matcha-kem`, `matcha-yen-mach`) chưa có công thức nguyên liệu. Đặt riêng thì bị 409; đặt chung với món khác thì món đó không bị trừ nguyên liệu. Test `ingredient-flow.test.ts` có một test cờ `todo` mô tả hành vi **TV4 đề xuất** (từ chối cả đơn); nhóm có thể chọn cách khác (ví dụ bổ sung công thức cho 4 món). Khi chốt xong thì bỏ cờ `todo` hoặc đổi nội dung test cho khớp.

## 9. Chạy và kiểm tra

Thiết lập một lần:

- Dùng `npm ci`, không dùng `npm install` để khỏi sửa `package-lock.json`. Không chạy `npm audit fix --force`.
- Tạo file `.env` ở thư mục gốc repo bằng cách chép từ `.env_vidu`. Không commit `.env`.

Kiểm tra trước khi coi một thay đổi là xong:

```
npm run lint
npx tsc --noEmit -p backend
npm test -w backend
```

Chạy backend: `npm run dev -w backend`.

Lưu ý khi viết code: dự án chạy bằng tsx nên constructor của service, controller và job phải dùng `@Inject(...)` rõ ràng; thiếu thì lỗi chỉ lộ khi có request, không lộ lúc khởi động.

## 10. Bộ test

Tất cả test dùng PGlite (PostgreSQL chạy bằng WebAssembly, một kết nối). Lỗi gõ sai tên bảng hay cột trong chuỗi SQL chỉ lộ khi chạy thật, nên SQL phải được test với PGlite.

| File (trong `backend/test`) | Kiểm tra |
|---|---|
| `tv4-helpers.ts` | Hàm dùng chung: dựng DB (001 đến 003, hoặc đủ 001 đến 006), sản phẩm riêng `tv4-tra` để không phụ thuộc dữ liệu mẫu |
| `order-model.test.ts`, `inventory-model.test.ts` | SQL của model, qua trigger 002 |
| `order-pricing.test.ts` | Tính đơn giá: size, topping, đầu vào sai |
| `order-service.test.ts` | `createOrder`, `cancelOrder`, `expirePendingOrders`, `preparePaymentRetry`, khuyến mãi |
| `order-expiry-job.test.ts` | Job không chạy chồng, không bị kẹt khi lỗi |
| `order-controller.test.ts` | Qua HTTP: 401, tạo đơn, hủy đơn (404, 409), hoàn tồn |
| `ingredient-flow.test.ts` | Luồng nguyên liệu: trừ, hoàn, hết nguyên liệu, thanh toán lại, món không công thức, quy tắc size M |
| `order-preview.test.ts` | `previewOrder` và các chốt chặn đầu vào dùng chung với `createOrder` |

Quy ước code:

- camelCase trong TypeScript, snake_case trong SQL (đặt bí danh `AS` để đổi tên cột).
- Cột JSONB ghi bằng `JSON.stringify` kèm `::jsonb` trong SQL.
- Ép kiểu dùng `as` viết thường. ESLint cấm `!=`, dùng `!==`.
- Lỗi nghiệp vụ ném từ service: BadRequest 400, NotFound 404, Conflict 409. Model chỉ trả dữ kiện (`true`, `false`, `null`).
- File `OrderExpiryJob.ts` giữ tên viết hoa; import trong test khớp tên này. Windows không phân biệt hoa thường nhưng Linux (CI) có.