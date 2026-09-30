import type { CartItem, Order, PaymentMethod } from "../types";

export const getServiceFee = (subtotal: number) => subtotal >= 150000 ? 0 : 5000;

export function createOrder(items: CartItem[], paymentMethod: PaymentMethod, subtotal: number, serviceFee: number): Order {
  return { id: `BL${String(Date.now()).slice(-6)}`, items, subtotal, serviceFee, total: subtotal + serviceFee, paymentMethod, status: "PAID", createdAt: new Date().toISOString() };
}
