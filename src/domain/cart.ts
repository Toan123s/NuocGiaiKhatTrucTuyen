import { getProduct, getUnitPrice } from "../data/products";
import type { CartItem, Product, SizeOption } from "../types";

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => {
    const product = getProduct(item.productId);
    return product ? total + getUnitPrice(product, item.sizeId, item.toppingIds) * item.quantity : total;
  }, 0);
}

export function createCartKey(product: Product, sizeId: SizeOption["id"], toppingIds: string[]) {
  return `${product.id}:${sizeId}:${[...toppingIds].sort().join("-")}`;
}

export function addCartItem(items: CartItem[], product: Product, sizeId: SizeOption["id"], toppingIds: string[], quantity: number) {
  const normalizedToppings = [...toppingIds].sort();
  const key = createCartKey(product, sizeId, normalizedToppings);
  const existing = items.find((item) => item.key === key);
  return existing
    ? items.map((item) => item.key === key ? { ...item, quantity: item.quantity + quantity } : item)
    : [...items, { key, productId: product.id, sizeId, toppingIds: normalizedToppings, quantity }];
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
