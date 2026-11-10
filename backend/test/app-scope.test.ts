import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module.js";

test("mock payment remains protected and removed extensions have no HTTP routes", async () => {
  const previousSource = process.env.PRODUCT_DATA_SOURCE;
  process.env.PRODUCT_DATA_SOURCE = "sample";
  const app = await NestFactory.create(AppModule, { logger: false });
  try {
    await app.listen(0, "127.0.0.1");
    const origin = await app.getUrl();
    const menu = await fetch(`${origin}/products`);
    assert.equal(menu.status, 200);
    assert.ok((await menu.json()).length > 0);
    for (const [path, status] of [
      ["/payments", 401],
      ["/orders", 401],
      ["/webhooks/sepay", 404],
      ["/auth/forgot-password", 404],
      ["/auth/reset-password", 404],
    ] as const) {
      const response = await fetch(`${origin}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      assert.equal(response.status, status, path);
    }
  } finally {
    await app.close();
    if (previousSource === undefined) delete process.env.PRODUCT_DATA_SOURCE;
    else process.env.PRODUCT_DATA_SOURCE = previousSource;
  }
});
