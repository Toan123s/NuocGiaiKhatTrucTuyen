# Selector E2E do TV2 bàn giao

Các `data-testid` dưới đây là contract ổn định cho TV6 viết Playwright. Có thể đổi class/CSS giao diện mà không đổi các selector này.

## Luồng Menu → Chi tiết món → Giỏ hàng → Checkout

| Trang | `data-testid` | Dùng để |
| --- | --- | --- |
| Menu `/` | `menu-section` | Chờ phần menu sẵn sàng |
| Menu `/` | `menu-search` | Tìm món khi cần |
| Menu `/` | `product-card` | Card món; có thuộc tính `data-product-id` |
| Menu `/` | `product-select-link` | Mở chi tiết món; dùng trong `product-card` đã lọc |
| Chi tiết `/products/:id` | `product-detail` | Xác nhận đúng món; có `data-product-id` |
| Chi tiết | `size-option-S`, `size-option-M`, `size-option-L` | Chọn size; có `aria-pressed` |
| Chi tiết | `topping-option-{id}` | Chọn topping theo ID từ API sản phẩm |
| Chi tiết | `add-to-cart` | Thêm cấu hình món vào giỏ |
| Chi tiết | `add-to-cart-confirmation` | Xác nhận đã thêm món |
| Chi tiết | `view-cart-link` | Mở giỏ từ thông báo thành công |
| Giỏ `/cart` | `cart-page` | Xác nhận trang giỏ đã mở |
| Giỏ `/cart` | `cart-empty-state` | Xác nhận giỏ trống (ví dụ sau khi thanh toán PAID) |
| Giỏ | `cart-item` | Dòng hàng; có `data-product-id`, `data-size`, `data-topping-ids`, `data-cart-item-key` |
| Giỏ | `cart-item-quantity` | Đọc số lượng trong dòng hàng |
| Giỏ | `cart-increase-quantity`, `cart-decrease-quantity`, `cart-remove-item` | Thao tác trên dòng hàng đã scope |
| Giỏ | `cart-checkout` | Mở checkout |
| Checkout `/checkout` | `checkout-page` | Xác nhận trang checkout đã mở |
| Checkout | `checkout-item` | Món được xác nhận; có `data-product-id`, `data-size`, `data-topping-ids` |
| Checkout | `promotion-code`, `promotion-apply` | Nhập và áp mã khuyến mãi (nếu kịch bản cần) |
| Checkout | `checkout-submit` | Gửi yêu cầu tạo đơn; bị disabled khi đang gửi |
| Checkout | `checkout-order-created` | Xác nhận backend đã tạo đơn |
| Checkout | `checkout-order-id` | Đọc mã đơn do backend trả về |
| Checkout | `checkout-payment-link` | Sang bước thanh toán với `orderId` |

## Ví dụ Playwright

```ts
const card = page.getByTestId("product-card").filter({ hasText: "Cà phê sữa" });
await card.getByTestId("product-select-link").click();

await page.getByTestId("size-option-M").click();
await page.getByTestId("topping-option-pearl").check();
await page.getByTestId("add-to-cart").click();
await page.getByTestId("view-cart-link").click();

const item = page.locator(
  '[data-testid="cart-item"][data-product-id="ca-phe-sua"][data-size="M"]',
);
await item.getByTestId("cart-increase-quantity").click();
await page.getByTestId("cart-checkout").click();

await page.getByTestId("checkout-submit").click();
await page.getByTestId("checkout-order-id").waitFor();
```

ID topping ví dụ cần được đối chiếu với dữ liệu `/products`; dùng ID thực tế của seed đang chạy. Khi có nhiều dòng cùng `productId`, lọc thêm `data-size` và `data-topping-ids` để chọn đúng dòng.

`checkout-order-created` chỉ xác nhận tạo đơn thành công. Checkout tạo đơn `PENDING`; thanh toán và xác nhận `PAID` nằm ở bước tiếp theo do TV5/TV6 phụ trách. Test toàn luồng nên xác nhận `PAID` tại trang kết quả thanh toán, không coi mã đơn ở checkout là đã thanh toán.
