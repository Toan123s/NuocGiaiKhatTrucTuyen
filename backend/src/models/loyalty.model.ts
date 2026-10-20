// TV5 — Model Loyalty: NƠI VIẾT SQL, không đặt logic giao diện/HTTP tại đây.
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
export class LoyaltyModel {
  // TODO TV5: INSERT EARN unique theo order/type; trigger loyalty_balance tự cập nhật users.loyalty_points, KHÔNG cộng thủ công; cùng transaction PAID.
  insertEarnOnce(
    userId: string,
    orderId: string,
    points: number,
    transaction: PoolClient,
  ): never {
    throw new NotImplementedException(
      "TV5: LoyaltyModel.insertEarnOnce chưa triển khai",
    );
  }
}
