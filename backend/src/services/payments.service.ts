// LOGIC NGHIỆP VỤ tại service này. Gọi PaymentModel trong src/models để truy cập SQL.
// Thành viên 5 — Payments. KHUNG CHƯA TRIỂN KHAI, không được coi là nghiệp vụ đã hoàn thành.
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
export class PaymentsService {
  // TODO TV5: POST /payments; PaymentView do TV5 làm, nhận orderId từ CheckoutView TV2 qua API tạo đơn của TV4.
  // Kiểm tra chủ đơn/JWT TV3, trạng thái và key/payload; chỉ một lần đang xử lý.
  createPayment(
    userId: string,
    input: PaymentInput,
    idempotencyKey: string,
  ): never {
    throw new NotImplementedException("TV5: createPayment chưa triển khai");
  }
  // TODO TV5: GET /payments/:id; trang /payment-status. Kiểm tra quyền sở hữu, trả trạng thái DB.
  getPaymentStatus(userId: string, paymentId: string): never {
    throw new NotImplementedException("TV5: getPaymentStatus chưa triển khai");
  }
  // TODO TV5: Đối soát timeout cùng key; không kết luận FAILED, không cho hủy hoặc tạo lần thanh toán mới khi chưa rõ kết quả.
  reconcilePayment(paymentId: string): never {
    throw new NotImplementedException("TV5: reconcilePayment chưa triển khai");
  }
  // TODO TV5: Transaction ngắn: SUCCEEDED + PAID + Loyalty; thất bại xác định gọi Inventory hoàn tồn.
  finalizePayment(paymentId: string, result: PaymentResult): never {
    throw new NotImplementedException("TV5: finalizePayment chưa triển khai");
  }
}
