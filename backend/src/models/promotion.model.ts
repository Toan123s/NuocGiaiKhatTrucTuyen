// TV1 — Model Promotion: NƠI VIẾT SQL, không đặt logic giao diện/HTTP tại đây.
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
export class PromotionModel {
  // TODO TV1: SELECT có tham số theo promotions.code (chuẩn hóa code thống nhất với service); trả id/code/type/value/minimum_amount/active/starts_at/ends_at.
  // Chỉ SQL; PromotionsService TV1 kiểm tra nghiệp vụ và TV4 gọi khi tạo đơn từ /checkout (UI TV2). Không tạo trang admin mã giảm giá.
  findByCode(code: string): never {
    throw new NotImplementedException(
      "TV1: PromotionModel.findByCode chưa triển khai",
    );
  }
}
