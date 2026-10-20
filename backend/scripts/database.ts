// TV3 duy trì runner/checksum/transaction; mỗi TV đề xuất migration phần mình. TV1 dùng khi dựng local, TV6 dùng trong CD.
// SQL 001/002: schema và kiểm tra DB. SQL 003: dữ liệu demo, không tự chạy khi start ứng dụng.
import "../src/config/environment";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { DatabaseService } from "../src/config/db";
async function main() {
  const db = new DatabaseService();
  try {
    const action = process.argv[2];
    if (action === "check") {
      await db.ping();
    } else if (action === "migrate" || action === "seed") {
      await db.withTransaction(async (client) => {
        // Hai người chạy lệnh cùng lúc vẫn tuần tự trên cùng DB.
        await client.query("SELECT pg_advisory_xact_lock(22032006)");
        if (action === "migrate") {
          await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations
       (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
          const directory = resolve(__dirname, "../database");
          const files = readdirSync(directory)
            .filter(
              (name) => /^\d{3}_.*\.sql$/.test(name) && name !== "003_seed.sql",
            )
            .sort();
          for (const name of files) {
            const sql = readFileSync(resolve(directory, name), "utf8");
            const checksum = createHash("sha256").update(sql).digest("hex");
            const current = await client.query(
              "SELECT checksum FROM schema_migrations WHERE name=$1",
              [name],
            );
            if (current.rows.length) {
              if (current.rows[0].checksum !== checksum)
                throw new Error(
                  `Migration đã chạy bị sửa: ${name}. Tạo file phiên bản mới.`,
                );
              continue;
            }
            await client.query(sql);
            await client.query(
              "INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)",
              [name, checksum],
            );
            console.log(`Đã áp dụng ${name}`);
          }
        } else {
          await client.query(
            readFileSync(
              resolve(__dirname, "../database/003_seed.sql"),
              "utf8",
            ),
          );
        }
      });
    } else throw new Error("Dùng migrate, seed hoặc check");
    console.log(`Database ${action}: thành công`);
  } finally {
    await db.onModuleDestroy();
  }
}
main().catch((error) => {
  console.error(
    "Lỗi database. Kiểm tra .env, thứ tự 001/002/003 và quyền tạo bảng.",
  );
  if (error && typeof error === "object" && "code" in error)
    console.error("Mã lỗi:", error.code);
  if (error instanceof Error && error.message.startsWith("Migration đã chạy"))
    console.error(error.message);
  process.exitCode = 1;
});
