// TV6 — Gọi backend TỪ TRÌNH DUYỆT (lib/api.ts hiện chỉ dùng phía server). Không viết SQL/secret ở đây.
// Mọi request đi qua request(): TV3 chỉ cần sửa getAccessToken() khi chốt cách lưu phiên.
import type {
  OrderDetail,
  OrderListPage,
} from "@/types/customer-order";

// Cần cấu hình khi build production (Docker/CD): NEXT_PUBLIC_API_BASE_URL=https://<api>.
const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// TODO TV3: trả access token theo cách nhóm chốt (bộ nhớ/cookie...). Chưa có phiên → null → backend trả 401.
// Nếu TV3 dùng cookie httpOnly thì thêm credentials: "include" ở request() và bật credentials trong CORS backend.
function getAccessToken(): string | null {
  return null;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function messageFromBody(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const message = (body as { message?: unknown }).message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.filter((m) => typeof m === "string").join(", ");
  return null;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ApiError(0, "Không kết nối được máy chủ");
  }

  const text = await response.text();
  let body: unknown = undefined;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      if (response.ok) throw new ApiError(502, "Phản hồi từ máy chủ không hợp lệ");
    }
  }
  if (!response.ok) {
    throw new ApiError(
      response.status,
      messageFromBody(body) ?? `Lỗi ${response.status}`,
    );
  }
  return body as T;
}

export function fetchMyOrders(
  { limit, offset }: { limit: number; offset: number },
  signal?: AbortSignal,
): Promise<OrderListPage> {
  return request<OrderListPage>(`/orders/me?limit=${limit}&offset=${offset}`, {
    signal,
  });
}

export function fetchOrderDetail(
  orderId: string,
  signal?: AbortSignal,
): Promise<OrderDetail> {
  return request<OrderDetail>(`/orders/${encodeURIComponent(orderId)}`, {
    signal,
  });
}

// API của TV4; hiện có thể trả 501. UI luôn tải lại trạng thái thật sau khi gọi.
export function cancelOrder(orderId: string): Promise<unknown> {
  return request<unknown>(`/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: "POST",
  });
}

/** Thông báo thân thiện cho người dùng; không lộ chi tiết lỗi máy chủ. */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.";
    if (error.status === 501) return "Chức năng này chưa sẵn sàng.";
    if (error.status >= 500) return "Máy chủ đang gặp sự cố, vui lòng thử lại sau.";
    return error.message;
  }
  return "Có lỗi xảy ra, vui lòng thử lại.";
}

export type LoadFailure =
  | { kind: "unauthorized" }
  | { kind: "notfound" }
  | { kind: "error"; message: string };

export function toFailure(error: unknown): LoadFailure {
  if (error instanceof ApiError && error.status === 401)
    return { kind: "unauthorized" };
  if (error instanceof ApiError && error.status === 404)
    return { kind: "notfound" };
  return { kind: "error", message: describeError(error) };
}
