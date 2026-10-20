import "reflect-metadata";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { ProductsService } from "../src/services/products.service";
import { ProductModel } from "../src/models/product.model";
import { DatabaseService } from "../src/config/db";
let app: INestApplication;
let origin: string;
before(async () => {
  process.env.PRODUCT_DATA_SOURCE = "sample";
  app = await NestFactory.create(AppModule, { logger: false });
  await app.listen(0, "127.0.0.1");
  origin = await app.getUrl();
});
after(async () => {
  await app?.close();
});
test("GET /products trả menu từ seed, tiền nguyên và ảnh trống", async () => {
  const response = await fetch(`${origin}/products`);
  assert.equal(response.status, 200);
  const rows = await response.json();
  assert.equal(rows.length, 40);
  assert.equal(new Set(rows.map((p: { id: string }) => p.id)).size, 40);
  for (const row of rows) {
    assert.ok(Number.isInteger(row.price) && row.price > 0);
    assert.equal(row.imageUrl, null);
    assert.ok(row.sizes.length > 0);
  }
});
test("health không giả vờ đã kiểm tra DB trong sample mode", async () => {
  const response = await fetch(`${origin}/health`);
  assert.deepEqual(await response.json(), {
    status: "ok",
    dataSource: "sample",
    database: "not-checked",
  });
});
test("API còn khung trả 501, không nhận đăng nhập/thanh toán giả", async () => {
  for (const [path, method] of [
    ["/auth/login", "POST"],
    ["/auth/register", "POST"],
    ["/orders", "POST"],
    ["/payments", "POST"],
    ["/orders/me", "GET"],
    ["/orders/abc", "GET"],
    ["/products/abc", "GET"],
  ]) {
    const response = await fetch(`${origin}${path}`, { method });
    assert.equal(response.status, 501, path);
  }
});
test("postgres model dùng query và không tự fallback seed khi DB lỗi", async () => {
  const db = new DatabaseService();
  const model = new ProductModel(db);
  const original = process.env.PRODUCT_DATA_SOURCE;
  try {
    process.env.PRODUCT_DATA_SOURCE = "postgres";
    db.query = async () => {
      throw new Error("DB down, sensitive connection details");
    };
    await assert.rejects(new ProductsService(model).getProducts(), (error) => {
      assert.ok(error instanceof Error);
      assert.ok(!error.message.includes("sensitive"));
      assert.ok(error.message.includes("Không tải được menu"));
      return true;
    });
  } finally {
    process.env.PRODUCT_DATA_SOURCE = original;
    await db.onModuleDestroy();
  }
});
