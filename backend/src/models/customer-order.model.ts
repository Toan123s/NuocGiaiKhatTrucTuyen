// TV6 — Model CustomerOrder: NƠI VIẾT SQL, không đặt logic giao diện/HTTP tại đây.
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
export class CustomerOrderModel {
  // TODO TV6: SELECT lịch sử WHERE user_id=$1, sắp mới nhất; /orders.
  findByUser(userId: string): never {
    throw new NotImplementedException(
      "TV6: CustomerOrderModel.findByUser chưa triển khai",
    );
  }
  // TODO TV6: SELECT đơn và items WHERE order_id=$1 AND user_id=$2; /orders/[id]; tránh đọc chéo khách.
  findOwnedOrder(userId: string, orderId: string): never {
    throw new NotImplementedException(
      "TV6: CustomerOrderModel.findOwnedOrder chưa triển khai",
    );
  }
}
