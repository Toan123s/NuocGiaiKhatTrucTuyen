// LOGIC NGHIỆP VỤ tại service này. Gọi LoyaltyModel trong src/models để truy cập SQL.
// Thành viên 5 — Loyalty. KHUNG CHƯA TRIỂN KHAI, không được coi là nghiệp vụ đã hoàn thành.
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
export class LoyaltyService {
  // TODO TV5: Chỉ gọi trong transaction chốt PAID; unique EARN theo orderId, trigger DB tự cộng tổng điểm; không UPDATE users thêm lần nữa.
  earnPoints(
    userId: string,
    orderId: string,
    amount: number,
    transaction: PoolClient,
  ): never {
    throw new NotImplementedException("TV5: earnPoints chưa triển khai");
  }
}
