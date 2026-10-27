// TV4 — Model Inventory: nơi viết SQL đọc/sửa tồn kho (cột stock, version của products).
// Không tự mở transaction; chỉ dùng PoolClient do service truyền vào.
import { Injectable } from "@nestjs/common";
import type { StockSnapshot } from "../types/order.types";
import type { PoolClient } from "../types/contracts";

@Injectable()
export class InventoryModel {
  // Khóa lạc quan: chỉ trừ khi đủ hàng và version chưa bị ai đổi. true = trừ được.
  async decreaseStock(
    productId: string,
    quantity: number,
    expectedVersion: number,
    transaction: PoolClient,
  ): Promise<boolean> {
    const result = await transaction.query(
      `UPDATE products
       SET stock = stock - $2, version = version + 1
       WHERE id = $1 AND stock >= $2 AND version = $3`,
      [productId, quantity, expectedVersion],
    );
    return result.rowCount === 1;
  }

  // Hoàn tồn đúng một lần nhờ cờ orders.stock_released. true = lần này vừa hoàn.
  async restoreStockOnce(
    orderId: string,
    transaction: PoolClient,
  ): Promise<boolean> {
    const marked = await transaction.query(
      `UPDATE orders
       SET stock_released = true
       WHERE id = $1 AND stock_released = false`,
      [orderId],
    );
    if (marked.rowCount !== 1) {
      return false; // đã có người hoàn trước đó
    }
    await transaction.query(
      `UPDATE products p
       SET stock = p.stock + r.qty, version = p.version + 1
       FROM (
         SELECT product_id, SUM(quantity) AS qty
         FROM order_items
         WHERE order_id = $1
         GROUP BY product_id
       ) r
       WHERE r.product_id = p.id`,
      [orderId],
    );
    return true;
  }

  async findStock(
    productId: string,
    transaction: PoolClient,
  ): Promise<StockSnapshot | null> {
    const result = await transaction.query(
      `SELECT stock, version
       FROM products
       WHERE id = $1`,
      [productId],
    );
    return (result.rows[0] as StockSnapshot) ?? null;
  }
}