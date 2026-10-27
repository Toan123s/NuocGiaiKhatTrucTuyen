// TV1 — Model chứa SQL cho sản phẩm. Seed dùng chung cho DB và chế độ sample.
import { Inject, Injectable, NotImplementedException } from "@nestjs/common";
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
  findById(id: string): never {
    throw new NotImplementedException(
      "TV1: ProductModel.findById chưa triển khai",
    );
  }
}
