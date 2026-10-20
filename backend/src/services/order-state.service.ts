// LOGIC NGHIỆP VỤ tại service này. Gọi OrderModel trong src/models để truy cập SQL.
// Thành viên 6 — OrderState. KHUNG CHƯA TRIỂN KHAI, không được coi là nghiệp vụ đã hoàn thành.
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
export class OrderStateService {
  // TODO TV6: Nội bộ: kiểm tra cạnh hợp lệ. Không mở endpoint nhân viên trong bộ khung.
  assertTransition(from: OrderStatus, to: OrderStatus): never {
    throw new NotImplementedException("TV6: assertTransition chưa triển khai");
  }
  // TODO TV6: Cập nhật có điều kiện theo trạng thái hiện tại trong transaction; test chuyển sai.
  transitionOrder(orderId: string, to: OrderStatus): never {
    throw new NotImplementedException("TV6: transitionOrder chưa triển khai");
  }
}
