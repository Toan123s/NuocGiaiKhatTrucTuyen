export type Category = "Cà phê" | "Trà" | "Đá xay";

export type SizeOption = {
  id: "S" | "M" | "L";
  label: string;
  delta: number;
};

export type Topping = {
  id: string;
  name: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  category: Category;
  description: string;
  imageUrl: string;
  basePrice: number;
  badge?: string;
  sizes: SizeOption[];
  toppings: Topping[];
};

export type CartItem = {
  key: string;
  productId: string;
  sizeId: SizeOption["id"];
  toppingIds: string[];
  quantity: number;
};

export type PaymentMethod = "wallet" | "card";

export type Order = {
  id: string;
  items: CartItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: "PAID";
  createdAt: string;
};

export type UserSession = {
  email: string;
  name: string;
};

export type AppView = "menu" | "checkout" | "confirmation" | "history";
