// TV1 — Model chứa SQL cho sản phẩm. Seed dùng chung cho DB và chế độ sample.
import { Inject, Injectable } from "@nestjs/common";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseService } from "../config/db";
import { dataSource } from "../config/environment";
import { Product } from "../types/product.types";
const unavailableProductIds = new Set([
  "matcha-kem",
  "matcha-dua",
  "matcha-dau",
  "matcha-yen-mach",
]);
@Injectable()
export class ProductModel {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  async findAll(): Promise<Product[]> {
    if (dataSource() === "sample") {
      const products = JSON.parse(
        readFileSync(
          resolve(__dirname, "../../database/seed/products.json"),
          "utf8",
        ),
      );
      return products.filter(
        (product: Product) => !unavailableProductIds.has(product.id),
      );
    }
    const result = await this.db
      .query<Product>(`SELECT id, name, category, price, description,
      badge, image_url AS "imageUrl", stock, sizes, toppings FROM products
      WHERE id <> ALL($1::text[]) ORDER BY position, id`, [
        [...unavailableProductIds],
      ]);
    return result.rows;
  }
  // TODO TV1: SELECT với tham số $1, trả Product hoặc null; service xử lý 404.
  // Gắn GET /products/:id và /products/[id]. Hiện chưa triển khai.
  async findById(id: string): Promise<Product | null> {
     if (dataSource() === "sample") {
        const products = JSON.parse(
          readFileSync(
            resolve(__dirname, "../../database/seed/products.json"),
            "utf8",
          ),
        ) as Product[];
        return (
          products.find(
            (product) =>
              product.id === id && !unavailableProductIds.has(product.id),
          ) ?? null
        );
      }
      // nếu không phải sample, thì gọi SQL để lấy sản phẩm theo id
      const result = await this.db.query<Product>(
        `SELECT id, name, category, price, description,
        badge, image_url AS "imageUrl", stock, sizes, toppings FROM products
        WHERE id = $1 AND id <> ALL($2::text[])`,
        [id, [...unavailableProductIds]],
      );
      return result.rows[0] ?? null;
  }
}
