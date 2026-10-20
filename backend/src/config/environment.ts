// TV3 — Nạp duy nhất .env tại gốc repo; process env được ưu tiên hơn file.
import { config } from "dotenv";
import { resolve } from "node:path";
config({ path: resolve(__dirname, "../../../.env"), quiet: true });
export function dataSource(): "postgres" | "sample" {
  const value = process.env.PRODUCT_DATA_SOURCE ?? "postgres";
  if (value !== "postgres" && value !== "sample")
    throw new Error("PRODUCT_DATA_SOURCE phải là postgres hoặc sample");
  return value;
}
