// TV3 — Model User: NƠI VIẾT SQL, không đặt logic giao diện/HTTP tại đây.
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
export class UserModel {
  // TODO TV3: SELECT tài khoản theo email tham số $1, dùng khi login; nội bộ service.
  findByEmail(email: string): never {
    throw new NotImplementedException(
      "TV3: UserModel.findByEmail chưa triển khai",
    );
  }
  // TODO TV3: INSERT tài khoản với email unique; nhận hash từ AuthService, không nhận mật khẩu thô.
  createUser(email: string, passwordHash: string): never {
    throw new NotImplementedException(
      "TV3: UserModel.createUser chưa triển khai",
    );
  }
  // TODO TV3: SELECT hồ sơ/điểm, không trả password_hash ra response.
  findById(userId: string): never {
    throw new NotImplementedException(
      "TV3: UserModel.findById chưa triển khai",
    );
  }
}
