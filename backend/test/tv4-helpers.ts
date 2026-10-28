// Hàm dùng chung cho test của TV4 (không phải file test vì không có đuôi .test.ts).
// Dựng PostgreSQL thật bằng PGlite, nạp 001/002/003, thêm một sản phẩm riêng của TV4.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { DatabaseService } from "../src/config/db";
import type { PoolClient } from "../src/types/contracts";

export const USER_ID = "demo-user-01";
export const PRODUCT_ID = "tv4-tra";
export const UNIT_S = 20000; // giá món size S
export const EXTRA_M = 5000; // phụ phí size M
export const TOPPING_TC = 7000; // topping "tc"

export async function createTestDb(): Promise<PGlite> {
  const db = new PGlite();
  const sql = (name: string) =>
    readFileSync(resolve(__dirname, "../database", name), "utf8");
  await db.exec(sql("001_schema.sql"));
  await db.exec(sql("002_integrity.sql"));
  await db.exec(sql("003_seed.sql"));
  // Sản phẩm riêng để test không phụ thuộc tồn kho của dữ liệu mẫu TV1.
  await db.query(
    `INSERT INTO products (id, name, category, price, stock, sizes, toppings)
     VALUES ($1, 'Trà TV4', 'test', $2, 10, $3::jsonb, $4::jsonb)`,
    [
      PRODUCT_ID,
      UNIT_S,
      JSON.stringify([
        { name: "S", extraPrice: 0 },
        { name: "M", extraPrice: EXTRA_M },
      ]),
      JSON.stringify([{ id: "tc", name: "Trân châu", price: TOPPING_TC }]),
    ],
  );
  return db;
}

// PGlite trả số dòng ở affectedRows, còn model đọc rowCount (kiểu của thư viện pg).
export function asClient(database: PGlite): PoolClient {
  return {
    async query(text: string, params: unknown[] = []) {
      const result = await database.query(text, params);
      return {
        rows: result.rows,
        rowCount: result.affectedRows || result.rows.length,
      };
    },
  } as unknown as PoolClient;
}

export type Tx = <T>(operation: (client: PoolClient) => Promise<T>) => Promise<T>;

// Giống DatabaseService.withTransaction: BEGIN, chạy, COMMIT; lỗi thì ROLLBACK.
export function makeTx(database: PGlite): Tx {
  return async (operation) => {
    await database.exec("BEGIN");
    try {
      const result = await operation(asClient(database));
      await database.exec("COMMIT");
      return result;
    } catch (error) {
      await database.exec("ROLLBACK");
      throw error;
    }
  };
}

// Bản giả của DatabaseService: withTransaction cho OrdersService, query cho PromotionModel của TV1.
// (Với pg thật, query chạy trên kết nối riêng; PGlite chỉ có một kết nối nên dùng chung.)
export function makeFakeDatabase(database: PGlite): DatabaseService {
  return {
    withTransaction: makeTx(database),
    query: (text: string, params: unknown[] = []) => database.query(text, params),
  } as unknown as DatabaseService;
}

// Tạo khuyến mãi riêng cho test; mốc thời gian tính bằng giờ so với hiện tại.
export async function insertPromotion(
  database: PGlite,
  promotion: {
    id: string;
    code: string;
    type: "PERCENT" | "FIXED";
    value: number;
    minimumAmount?: number;
    active?: boolean;
    startsHoursFromNow?: number;
    endsHoursFromNow?: number;
  },
): Promise<void> {
  await database.query(
    `INSERT INTO promotions (id, code, type, value, minimum_amount, active, starts_at, ends_at)
     VALUES ($1, $2, $3, $4, $5, $6,
             now() + ($7::int * interval '1 hour'),
             now() + ($8::int * interval '1 hour'))`,
    [
      promotion.id,
      promotion.code,
      promotion.type,
      promotion.value,
      promotion.minimumAmount ?? 0,
      promotion.active ?? true,
      promotion.startsHoursFromNow ?? -24,
      promotion.endsHoursFromNow ?? 24,
    ],
  );
}

export async function readStock(database: PGlite): Promise<number> {
  const result = await database.query<{ stock: number }>(
    "SELECT stock FROM products WHERE id = $1",
    [PRODUCT_ID],
  );
  return result.rows[0].stock;
}

export async function setStock(database: PGlite, stock: number): Promise<void> {
  await database.query("UPDATE products SET stock = $1 WHERE id = $2", [
    stock,
    PRODUCT_ID,
  ]);
}

export async function readOrder(database: PGlite, orderId: string) {
  const result = await database.query<{
    status: string;
    stock_released: boolean;
    user_id: string;
  }>("SELECT status, stock_released, user_id FROM orders WHERE id = $1", [
    orderId,
  ]);
  return result.rows[0];
}

export async function countOrders(database: PGlite): Promise<number> {
  const result = await database.query<{ n: number }>(
    "SELECT count(*)::int AS n FROM orders",
  );
  return result.rows[0].n;
}