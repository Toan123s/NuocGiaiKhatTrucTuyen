// LOGIC NGHIỆP VỤ tại service này. Gọi OrderModel + InventoryModel trong src/models để truy cập SQL.
// Thành viên 4 — Orders. KHUNG CHƯA TRIỂN KHAI, không được coi là nghiệp vụ đã hoàn thành.
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
export class OrdersService {
  // TODO TV4: BACKEND của /checkout; UI CheckoutView thuộc TV2. Tính lại giá từ DB, gọi PromotionsService của TV1; không tin giá client.
  // previewOrder hiện mới là service khung, chưa có route API preview riêng; thống nhất request/response với TV1 và TV2 trước khi nối giao diện.
  previewOrder(userId: string, input: CreateOrderInput): never {
    throw new NotImplementedException("TV4: previewOrder chưa triển khai");
  }
  // TODO TV4: POST /orders nhận dữ liệu từ CheckoutView TV2, trả orderId/status/subtotal/discount/total chính thức để TV2 chuyển sang PaymentView TV5.
  // Cùng một PoolClient: giữ tồn + INSERT orders PENDING + INSERT order_items ngay trong transaction tạo đơn (002 khóa chi tiết sau commit).
  createOrder(userId: string, input: CreateOrderInput): never {
    throw new NotImplementedException("TV4: createOrder chưa triển khai");
  }
  // TODO TV4: Hủy từ chi tiết đơn; kiểm tra chủ đơn, chặn PROCESSING/PAID; hoàn tồn đúng một lần.
  cancelOrder(userId: string, orderId: string): never {
    throw new NotImplementedException("TV4: cancelOrder chưa triển khai");
  }
  // TODO TV4: Job hết hạn giữ tồn (đề xuất 15 phút); không hủy khi giao dịch PROCESSING.
  expirePendingOrders(): never {
    throw new NotImplementedException(
      "TV4: expirePendingOrders chưa triển khai",
    );
  }
  // TODO TV4: PAYMENT_FAILED: giữ tồn mới bằng Inventory, về PENDING trước lần thử mới.
  preparePaymentRetry(userId: string, orderId: string): never {
    throw new NotImplementedException(
      "TV4: preparePaymentRetry chưa triển khai",
    );
  }
}
