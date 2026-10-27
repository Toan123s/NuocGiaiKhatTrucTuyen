// TV4 — Inventory service: logic giữ và hoàn tồn kho. SQL nằm ở InventoryModel.
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InventoryModel } from "../models/inventory.model";
import type { PoolClient, StockItem } from "../types/contracts";

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryModel: InventoryModel) {}

  // Gộp số lượng theo productId rồi trừ kho; thiếu hàng/tranh tồn thì ném lỗi để transaction rollback.
  async reserveStock(
    items: StockItem[],
    transaction: PoolClient,
  ): Promise<void> {
    const totals = new Map<string, number>();
    for (const item of items) {
      const current = totals.get(item.productId) ?? 0;
      totals.set(item.productId, current + item.quantity);
    }

    for (const [productId, quantity] of totals) {
      const snapshot = await this.inventoryModel.findStock(productId, transaction);
      if (snapshot === null) {
        throw new NotFoundException(`Không tìm thấy sản phẩm ${productId}`);
      }
      if (snapshot.stock < quantity) {
        throw new ConflictException(`Sản phẩm ${productId} không đủ hàng`);
      }

      const ok = await this.inventoryModel.decreaseStock(
        productId,
        quantity,
        snapshot.version,
        transaction,
      );
      if (!ok) {
        throw new ConflictException(`Sản phẩm ${productId} vừa bị người khác đặt`);
      }
    }
  }

  // true = vừa hoàn tồn, false = đã hoàn trước đó (không phải lỗi).
  async releaseStock(orderId: string, transaction: PoolClient): Promise<boolean> {
    return this.inventoryModel.restoreStockOnce(orderId, transaction);
  }
}