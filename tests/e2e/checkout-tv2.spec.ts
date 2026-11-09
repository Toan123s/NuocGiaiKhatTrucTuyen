import { expect, test, type Page, type Route } from "@playwright/test";

const apiBaseUrl = (
  process.env.E2E_API_BASE_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

test.use({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000" });

type Product = {
  id: string;
  name: string;
  sizes: { name: string; extraPrice: number }[];
  toppings: { id: string; name: string; price: number }[];
};

async function getProductForCheckout(page: Page): Promise<Product> {
  const response = await page.request.get(`${apiBaseUrl}/products`);
  expect(response.ok(), "API thực đơn cần chạy để tải sản phẩm").toBeTruthy();
  const products = (await response.json()) as Product[];
  const product = products.find(
    (candidate) => candidate.sizes?.length > 0 && candidate.toppings?.length > 0,
  );
  expect(product, "Seed cần có ít nhất một món có size và topping").toBeTruthy();
  return product!;
}

async function openProductFromMenu(page: Page, product: Product) {
  await page.goto("/");
  await page.getByRole("link", { name: `Xem ${product.name}` }).click();
  await expect(page).toHaveURL(new RegExp(`/products/${product.id}$`));
  await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
  await page
    .getByRole("button", {
      name: `Size ${product.sizes[0].name}`,
      exact: false,
    })
    .click();
  await page.locator('input[type="checkbox"]').first().check();
}

async function addProductToCart(page: Page) {
  await page.getByRole("button", { name: /Thêm vào giỏ hàng/ }).click();
  await expect(page.getByRole("status")).toContainText("Đã thêm");
}

test.describe("E2E giỏ hàng và checkout (TV2 + TV6)", () => {
  test("TV2: gộp cùng cấu hình, giới hạn số lượng và giữ giỏ sau khi tải lại", async ({ page }) => {
    const product = await getProductForCheckout(page);
    await page.route("**/products/*/check-stock", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
    );

    await openProductFromMenu(page, product);
    await addProductToCart(page);
    await page.goto(`/products/${product.id}`);
    await page
      .getByRole("button", {
        name: `Size ${product.sizes[0].name}`,
        exact: false,
      })
      .click();
    await page.locator('input[type="checkbox"]').first().check();
    await addProductToCart(page);

    await page.goto("/cart");
    await expect(page.locator(".cart-item")).toHaveCount(1);
    const sameVariant = page.locator(".cart-item").first();
    await expect(sameVariant).toContainText(`Size ${product.sizes[0].name}`);
    await expect(sameVariant.locator(".quantity-control")).toContainText("2");
    await expect(sameVariant.getByRole("button", { name: "Giảm số lượng" })).toBeEnabled();

    const decrement = sameVariant.getByRole("button", { name: "Giảm số lượng" });
    const increment = sameVariant.getByRole("button", { name: "Tăng số lượng" });
    await decrement.click();
    await expect(sameVariant.locator(".quantity-control")).toContainText("1");
    await expect(decrement).toBeDisabled();
    for (let quantity = 1; quantity < 99; quantity += 1) {
      await increment.click();
    }
    await expect(sameVariant.locator(".quantity-control")).toContainText("99");
    await expect(increment).toBeDisabled();

    await page.reload();
    await expect(page.locator(".cart-item")).toHaveCount(1);
    await expect(page.locator(".quantity-control")).toContainText("99");

    const otherSize = product.sizes.find((size) => size.name !== product.sizes[0].name);
    test.skip(!otherSize, "Seed sản phẩm cần có ít nhất hai size để kiểm tra tách cấu hình");
    await page.goto(`/products/${product.id}`);
    await page
      .getByRole("button", { name: `Size ${otherSize!.name}`, exact: false })
      .click();
    await page.locator('input[type="checkbox"]').first().check();
    await addProductToCart(page);
    await page.goto("/cart");
    await expect(page.locator(".cart-item")).toHaveCount(2);
  });

  test("TV2 + TV6: chỉ tạo một đơn khi submit liên tiếp, thanh toán xong mới xóa giỏ", async ({ page }) => {
    const product = await getProductForCheckout(page);
    const orderId = "e2e-order-paid";
    let orderCount = 0;
    let paymentCount = 0;
    let orderStatus: "PENDING" | "PAYMENT_FAILED" | "PAID" = "PENDING";
    let paymentAttempt: "FAILED" | "SUCCEEDED" | null = null;
    const orderDetail = () => ({
      id: orderId,
      status: orderStatus,
      subtotal: 50000,
      discount: 0,
      total: 50000,
      promotionCode: null,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      items: [],
      payments: paymentAttempt
        ? [{
            id: "e2e-payment",
            method: "WALLET",
            status: paymentAttempt,
            amount: 50000,
            createdAt: new Date().toISOString(),
            resolvedAt: new Date().toISOString(),
          }]
        : [],
      pointsEarned: orderStatus === "PAID" ? 5 : null,
      canCancel: orderStatus !== "PAID",
      canRetryPayment: orderStatus === "PAYMENT_FAILED",
    });

    await page.route("**/products/*/check-stock", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
    );
    await page.route("**/auth/login", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accessToken: "playwright-e2e-token",
          tokenType: "Bearer",
          expiresIn: 3600,
          user: { id: "e2e-user", email: "khach01@brewlite.test", displayName: "Khách thử nghiệm", loyaltyPoints: 0 },
        }),
      }),
    );
    await page.route("**/orders", async (route: Route) => {
      if (route.request().method() !== "POST") return route.fallback();
      orderCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 250));
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ orderId, status: "PENDING", subtotal: 50000, discount: 0, total: 50000 }),
      });
    });
    await page.route(`**/orders/${orderId}`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(orderDetail()),
      }),
    );
    await page.route(`**/orders/${orderId}/retry-payment`, async (route) => {
      orderStatus = "PENDING";
      paymentAttempt = null;
      return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });
    await page.route("**/payments", async (route) => {
      if (route.request().method() !== "POST") return route.fallback();
      const status = paymentCount++ === 0 ? "FAILED" : "SUCCEEDED";
      paymentAttempt = status;
      orderStatus = status === "SUCCEEDED" ? "PAID" : "PAYMENT_FAILED";
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ status }),
      });
    });

    await openProductFromMenu(page, product);
    await addProductToCart(page);
    await page.goto("/checkout");
    await page.getByRole("button", { name: "Đăng nhập để tiếp tục" }).click();
    await expect(page).toHaveURL(/\/login\?returnUrl=/);
    // Wait for LoginView's client effect before filling controlled inputs; otherwise
    // Next.js can hydrate and reset values entered into the server-rendered form.
    await expect(page.getByRole("link", { name: "Tạo tài khoản" })).toHaveAttribute(
      "href",
      "/register?returnUrl=%2Fcheckout",
    );
    await page.getByLabel("Email").fill("khach01@brewlite.test");
    await page.getByLabel("Mật khẩu").fill("BrewLite123!");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL(/\/checkout$/);

    const submit = page.getByRole("button", { name: "Xác nhận đặt hàng" });
    await submit.dblclick();
    await expect(page.getByRole("heading", { name: "Đơn của bạn đã sẵn sàng" })).toBeVisible();
    expect(orderCount).toBe(1);
    await expect(page.getByRole("link", { name: /Tiến hành thanh toán/ })).toBeVisible();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cart") ?? "[]").length)).toBe(1);

    await page.getByRole("link", { name: /Tiến hành thanh toán/ }).click();
    await expect(page.getByRole("heading", { name: "Thanh toán không tiền mặt" })).toBeVisible();
    await page.getByRole("button", { name: /Thanh toán/ }).click();
    await expect(page).toHaveURL(/\/payment-status\?orderId=/);
    await expect(page.getByRole("heading", { name: "Thanh toán không thành công" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cart") ?? "[]").length)).toBe(1);

    await page.getByRole("link", { name: "Thử thanh toán lại" }).click();
    await expect(page.getByRole("heading", { name: "Thanh toán không tiền mặt" })).toBeVisible();
    await page.getByRole("button", { name: /Thanh toán/ }).click();
    await expect(page).toHaveURL(/\/payment-status\?orderId=/);
    await expect(page.getByRole("heading", { name: "Thanh toán thành công" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cart") ?? "[]").length)).toBe(0);
    await expect(page.getByText(orderId.slice(-8).toUpperCase())).toBeVisible();
  });
});
