// LOGIC NGHIỆP VỤ tại service này. Gọi PromotionModel trong src/models để truy cập SQL.
// Thành viên 1 — Promotions. KHUNG CHƯA TRIỂN KHAI, không được coi là nghiệp vụ đã hoàn thành.
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
export class PromotionsService {
  // TODO TV1: Kiểm tra active, starts_at/ends_at và minimum_amount; gọi PromotionModel.findByCode.
  // OrdersService của TV4 gọi nội bộ khi xử lý /checkout (UI TV2); mã sai không tạo đơn.
  // Không gọi service NestJS trực tiếp từ browser. Nếu cần API preview, TV1/TV4 chốt contract trước khi thêm route; khung hiện chưa có route preview riêng.
  validatePromotion(code: string, subtotal: number): never {
    throw new NotImplementedException("TV1: validatePromotion chưa triển khai");
  }
  // TODO TV1: OrdersService TV4 gọi nội bộ; PERCENT/FIXED, làm tròn VNĐ theo quy ước nhóm, clamp 0..subtotal.
  // Test mã hợp lệ/hết hạn/chưa tới hạn/bị tắt/thiếu mức tối thiểu/giảm vượt tổng/100%; không cộng điểm tại đây.
  calculateDiscount(promotion: PromotionInput, subtotal: number): never {
    throw new NotImplementedException("TV1: calculateDiscount chưa triển khai");
  }
}
