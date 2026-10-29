// TV3 — Model User: NƠI VIẾT SQL, không đặt logic giao diện/HTTP tại đây.
// SQL luôn dùng tham số $1, $2...; chỉ findByEmail trả passwordHash (cho AuthService), các hàm còn lại không bao giờ SELECT password_hash.
import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { DatabaseService } from "../config/db";
import type { PublicUser, UserRecord } from "../types/auth.types";
interface PublicUserRow {
  id: string;
  email: string;
  displayName: string;
  // pg trả bigint/numeric dưới dạng chuỗi; ép về number ở toPublicUser.
  loyaltyPoints: number | string;
}
interface UserRow extends PublicUserRow {
  passwordHash: string;
}
const PUBLIC_COLUMNS = `id, email, display_name AS "displayName", loyalty_points AS "loyaltyPoints"`;
function toPublicUser(row: PublicUserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    loyaltyPoints: Number(row.loyaltyPoints),
  };
}
@Injectable()
export class UserModel {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}
  // Email so khớp không phân biệt hoa thường, cùng quy tắc với ràng buộc UNIQUE trong schema.
  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.db.query<UserRow>(
      `SELECT ${PUBLIC_COLUMNS}, password_hash AS "passwordHash"
       FROM users WHERE lower(email) = lower($1) LIMIT 1`,
      [email],
    );
    const row = result.rows[0];
    return row ? { ...toPublicUser(row), passwordHash: row.passwordHash } : null;
  }
  // Nhận hash từ AuthService (không bao giờ nhận mật khẩu thô). Email trùng làm DB ném lỗi 23505, service đổi thành 409.
  async createUser(
    email: string,
    passwordHash: string,
    displayName: string = email.split("@")[0] ?? email,
  ): Promise<PublicUser> {
    const result = await this.db.query<PublicUserRow>(
      `INSERT INTO users (id, email, password_hash, display_name, loyalty_points)
       VALUES ($1, $2, $3, $4, 0)
       RETURNING ${PUBLIC_COLUMNS}`,
      [randomUUID(), email, passwordHash, displayName],
    );
    const row = result.rows[0];
    if (!row) throw new Error("INSERT users không trả về dòng nào");
    return toPublicUser(row);
  }
  async findById(userId: string): Promise<PublicUser | null> {
    const result = await this.db.query<PublicUserRow>(
      `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`,
      [userId],
    );
    const row = result.rows[0];
    return row ? toPublicUser(row) : null;
  }
}
