// LOGIC NGHIỆP VỤ tại service này. Gọi CustomerOrderModel trong src/models để truy cập SQL.
// Thành viên 6 — CustomerOrders. KHUNG CHƯA TRIỂN KHAI, không được coi là nghiệp vụ đã hoàn thành.
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
export class CustomerOrdersService {
  // TODO TV6: GET /orders/me; trang /orders. Lấy userId từ JWT, không lấy từ query client.
  getMyOrders(userId: string): never {
    throw new NotImplementedException("TV6: getMyOrders chưa triển khai");
  }
  // TODO TV6: GET /orders/:id; trang /orders/[id]. Chặn đọc đơn người khác, trả 403/404 theo quy ước nhóm.
  getOrderDetail(userId: string, orderId: string): never {
    throw new NotImplementedException("TV6: getOrderDetail chưa triển khai");
  }
}
