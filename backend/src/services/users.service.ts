// LOGIC NGHIỆP VỤ tại service này. Gọi UserModel trong src/models để truy cập SQL.
// Thành viên 3 — Users. KHUNG CHƯA TRIỂN KHAI, không được coi là nghiệp vụ đã hoàn thành.
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
export class UsersService {
  // TODO TV3: AuthService tra user nội bộ; model SQL tham số, không lộ passwordHash ra API.
  findByEmail(email: string): never {
    throw new NotImplementedException("TV3: findByEmail chưa triển khai");
  }
  // TODO TV3: Trang tài khoản tương lai; chỉ đọc user từ JWT đã xác thực.
  getCurrentUser(userId: string): never {
    throw new NotImplementedException("TV3: getCurrentUser chưa triển khai");
  }
}
