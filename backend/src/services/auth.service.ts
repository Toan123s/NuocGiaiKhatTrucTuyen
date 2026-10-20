// LOGIC NGHIỆP VỤ tại service này. Gọi UserModel trong src/models để truy cập SQL.
// Thành viên 3 — Auth. KHUNG CHƯA TRIỂN KHAI, không được coi là nghiệp vụ đã hoàn thành.
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
export class AuthService {
  // TODO TV3: POST /auth/register; trang /register. Validate email/password, unique email, bcrypt; không nhận role từ client.
  register(input: RegisterInput): never {
    throw new NotImplementedException("TV3: register chưa triển khai");
  }
  // TODO TV3: POST /auth/login; trang /login. So khớp bcrypt, cấp JWT; không trả passwordHash.
  login(input: LoginInput): never {
    throw new NotImplementedException("TV3: login chưa triển khai");
  }
  // TODO TV3: Guard cho Orders/Payments; từ chối JWT thiếu/sai/hết hạn với 401.
  verifyAccessToken(token: string): never {
    throw new NotImplementedException("TV3: verifyAccessToken chưa triển khai");
  }
}
