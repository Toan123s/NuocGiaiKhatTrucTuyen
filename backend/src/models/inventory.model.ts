// TV4 — Model Inventory: NƠI VIẾT SQL, không đặt logic giao diện/HTTP tại đây.
// Chưa triển khai. Service cùng tên nghiệp vụ sẽ gọi model; SQL luôn dùng tham số $1, $2...
import { Injectable, NotImplementedException } from "@nestjs/common";
import type {
  PoolClient,
  OrderLine,
  OrderStatus,
  PaymentInput,
  PaymentResult,
} from "../types/contracts";
@Injectable()
export class InventoryModel {
  // TODO TV4: UPDATE stock=stock-$2, version=version+1 WHERE stock >= $2 AND version=$3; service xử lý khi không cập nhật.
  decreaseStock(
    productId: string,
    quantity: number,
    expectedVersion: number,
    transaction: PoolClient,
  ): never {
    throw new NotImplementedException(
      "TV4: InventoryModel.decreaseStock chưa triển khai",
    );
  }
  // TODO TV4: UPDATE tồn và dấu hoàn tồn của đơn đúng một lần; không tự mở transaction mới.
  restoreStockOnce(orderId: string, transaction: PoolClient): never {
    throw new NotImplementedException(
      "TV4: InventoryModel.restoreStockOnce chưa triển khai",
    );
  }
}
