// Khai báo URL tập trung. Controller dùng các hằng này qua decorator NestJS.
// TV1 products, TV4 đặt/hủy, TV5 payments, TV6 đọc đơn. KHÔNG viết SQL/nghiệp vụ ở route.
export const CUSTOMER_ROUTES = {
  products: { base: "products", list: "", detail: ":id" },
  orders: {
    base: "orders",
    create: "",
    mine: "me",
    detail: ":id",
    cancel: ":id/cancel",
  },
  payments: { base: "payments", create: "", status: ":id" },
} as const;
