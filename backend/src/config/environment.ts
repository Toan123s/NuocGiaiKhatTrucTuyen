// TV3 — Nạp duy nhất .env tại gốc repo; process env được ưu tiên hơn file. Cấu hình Auth (JWT) cũng đặt ở đây.
import { config } from "dotenv";
import { resolve } from "node:path";
config({ path: resolve(__dirname, "../../../.env"), quiet: true });
// Lỗi cấu hình có thông điệp an toàn để in ra console (không chứa giá trị bí mật).
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}
export function dataSource(): "postgres" | "sample" {
  const value = process.env.PRODUCT_DATA_SOURCE ?? "postgres";
  if (value !== "postgres" && value !== "sample")
    throw new ConfigurationError(
      "PRODUCT_DATA_SOURCE phải là postgres hoặc sample",
    );
  return value;
}
export interface AuthConfig {
  jwtSecret: string;
  accessTokenTtlSeconds: number;
}
const JWT_SECRET_MIN_LENGTH = 32;
// Giá trị mẫu trong .env_vidu: "replace_" là chuỗi cũ (luôn bị từ chối, phải đặt secret thật);
// "local_only" chỉ dùng cho máy local và bị từ chối khi NODE_ENV=production.
const STALE_SECRET_MARKER = "replace_";
const LOCAL_SECRET_MARKER = "local_only";
export function usesLocalSampleJwtSecret(): boolean {
  return (process.env.JWT_SECRET ?? "").includes(LOCAL_SECRET_MARKER);
}
const TOKEN_TTL_MIN_SECONDS = 60;
const TOKEN_TTL_MAX_SECONDS = 60 * 60 * 24 * 30;
// Đọc lười (khi dùng) để test/sample mode không bắt buộc có JWT_SECRET; main.ts gọi sớm để dừng nếu thiếu.
export function authConfig(): AuthConfig {
  const jwtSecret = process.env.JWT_SECRET ?? "";
  if (jwtSecret.length < JWT_SECRET_MIN_LENGTH)
    throw new ConfigurationError(
      `JWT_SECRET phải có ít nhất ${JWT_SECRET_MIN_LENGTH} ký tự. Tạo bằng: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`,
    );
  if (jwtSecret.includes(STALE_SECRET_MARKER))
    throw new ConfigurationError(
      "JWT_SECRET đang là chuỗi mẫu cũ. Lấy JWT_SECRET mới từ .env_vidu hoặc tạo secret riêng.",
    );
  if (process.env.NODE_ENV === "production" && usesLocalSampleJwtSecret())
    throw new ConfigurationError(
      "JWT_SECRET đang là giá trị mẫu của máy local. Production phải đặt secret riêng, ngẫu nhiên.",
    );
  const ttl = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? "900");
  if (
    !Number.isInteger(ttl) ||
    ttl < TOKEN_TTL_MIN_SECONDS ||
    ttl > TOKEN_TTL_MAX_SECONDS
  )
    throw new ConfigurationError(
      `JWT_EXPIRES_IN_SECONDS phải là số nguyên giây từ ${TOKEN_TTL_MIN_SECONDS} đến ${TOKEN_TTL_MAX_SECONDS}`,
    );
  return { jwtSecret, accessTokenTtlSeconds: ttl };
}
