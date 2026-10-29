// LOGIC NGHIỆP VỤ tại service này. Gọi InventoryModel trong src/models để truy cập SQL.
// Thành viên 4 — Inventory. KHUNG CHƯA TRIỂN KHAI, không được coi là nghiệp vụ đã hoàn thành.
import { Injectable, NotImplementedException } from "@nestjs/common";
import type {
  RegisterInput,
  LoginInput,
  CreateOrderInput,
  StockItem,
  PoolClient,
  PromotionInput,
  PaymentInput,
  PaymentResult,
  OrderStatus,
} from "../types/contracts";
@Injectable()
export class InventoryService {
  // TODO TV4: Nội bộ createOrder; gộp số lượng theo productId, kiểm tra stock và version, rollback nếu xung đột.
  reserveStock(items: StockItem[], transaction: PoolClient): never {
    throw new NotImplementedException("TV4: reserveStock chưa triển khai");
  }
  // TODO TV4: Nội bộ hủy/thất bại; ghi dấu đã hoàn, tránh hoàn tồn hai lần.
  releaseStock(orderId: string, transaction: PoolClient): never {
    throw new NotImplementedException("TV4: releaseStock chưa triển khai");
  }
}
