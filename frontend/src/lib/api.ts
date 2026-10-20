// TV3 — Client phía server. Không đưa DB_PASSWORD/JWT_SECRET xuống trình duyệt.
import "server-only";
import { Product } from "@/types/product";
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(
    `${process.env.API_BASE_URL ?? "http://localhost:4000"}/products`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    },
  );
  if (!response.ok) throw new Error("Không tải được menu");
  return response.json();
}
