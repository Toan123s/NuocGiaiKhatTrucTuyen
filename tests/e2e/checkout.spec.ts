import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

const webUrl = process.env.E2E_WEB_URL ?? "http://localhost:3000";
const apiUrl = process.env.E2E_API_URL ?? "http://localhost:4000";
const email = process.env.E2E_EMAIL ?? "khach01@brewlite.test";
const password = process.env.E2E_PASSWORD ?? "BrewLite123!";

function readRootEnv(name: string): string | undefined {
  const envPath = resolve(process.cwd(), ".env");
  try {
    const line = readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .find((entry) => entry.trim().startsWith(`${name}=`));
    if (!line) return undefined;
    return line
      .slice(line.indexOf("=") + 1)
      .trim()
      .replace(/^(["'])(.*)\1$/, "$2");
  } catch {
    return undefined;
  }
}

test.use({ baseURL: webUrl });
test.setTimeout(90_000);

test("khách đặt món từ menu, đăng nhập, rồi nhận kết quả PAID từ webhook mô phỏng", async ({
  page,
  request,
}) => {
  const webhookKey =
    process.env.SEPAY_WEBHOOK_API_KEY ?? readRootEnv("SEPAY_WEBHOOK_API_KEY");
  expect(
    webhookKey,
    "Cần đặt SEPAY_WEBHOOK_API_KEY trong .env hoặc environment để mô phỏng callback thanh toán.",
  ).toBeTruthy();

  await page.goto("/");
  await expect(page.getByTestId("menu-section")).toBeVisible();
  const coffee = page.locator(
    '[data-testid="product-card"][data-product-id="ca-phe-sua"]',
  );
  await expect(coffee).toBeVisible();
  await coffee.getByTestId("product-select-link").click();

  await expect(page.getByTestId("product-detail")).toHaveAttribute(
    "data-product-id",
    "ca-phe-sua",
  );
  await page.getByTestId("size-option-M").click();
  await page.getByTestId("topping-option-pearl").check();
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByTestId("add-to-cart-confirmation")).toBeVisible();
  await page.getByTestId("view-cart-link").click();

  await expect(page.getByTestId("cart-page")).toBeVisible();
  const cartItem = page.locator(
    '[data-testid="cart-item"][data-product-id="ca-phe-sua"][data-size="M"][data-topping-ids="pearl"]',
  );
  await expect(cartItem).toBeVisible();
  await expect(cartItem.getByTestId("cart-item-quantity")).toHaveText("1");
  await page.getByTestId("cart-checkout").click();

  await expect(page.getByTestId("checkout-page")).toBeVisible();
  await page.getByTestId("checkout-submit").click();
  await expect(page).toHaveURL(/\/login\?.*returnUrl=%2Fcheckout/);
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();

  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByTestId("checkout-item")).toBeVisible();
  const createOrderResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/orders",
  );
  await page.getByTestId("checkout-submit").click();
  const createOrderResponse = await createOrderResponsePromise;
  expect(createOrderResponse.ok()).toBeTruthy();
  const createdOrder = (await createOrderResponse.json()) as {
    orderId: string;
    status: string;
    total: number;
  };
  expect(createdOrder.status).toBe("PENDING");
  await expect(page.getByTestId("checkout-order-id")).toHaveText(
    createdOrder.orderId,
  );

  await page.getByTestId("checkout-payment-link").click();
  await expect(page).toHaveURL(/\/payment\?orderId=/);

  // SePay là cổng thanh toán mock của môi trường demo: callback này cập nhật DB thật,
  // sau đó trang kết quả phải đọc PAID từ GET /orders/:id, không tin trạng thái trên URL.
  const webhookResponse = await request.post(`${apiUrl}/webhooks/sepay`, {
    headers: { Authorization: `Apikey ${webhookKey}` },
    data: {
      id: Date.now(),
      gateway: "E2E-MOCK",
      transactionDate: new Date().toISOString(),
      accountNumber: "E2E-TEST",
      content: `BREWLITE-ORDER-${createdOrder.orderId}`,
      transferType: "in",
      transferAmount: createdOrder.total,
      referenceCode: `E2E-${createdOrder.orderId}`,
    },
  });
  expect(webhookResponse.ok()).toBeTruthy();
  expect(await webhookResponse.json()).toMatchObject({
    status: "PAID",
    orderId: createdOrder.orderId,
  });

  await page.goto(
    `/payment-status?orderId=${encodeURIComponent(createdOrder.orderId)}`,
  );
  await expect(
    page.getByRole("heading", { name: "Thanh toán thành công" }),
  ).toBeVisible();

  await page.goto("/cart");
  await expect(page.getByTestId("cart-empty-state")).toBeVisible();
});
