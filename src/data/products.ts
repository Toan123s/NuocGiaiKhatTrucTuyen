import type { Product, SizeOption, Topping } from "../types";

const sizes: SizeOption[] = [
  { id: "S", label: "Nhỏ", delta: -5000 },
  { id: "M", label: "Vừa", delta: 0 },
  { id: "L", label: "Lớn", delta: 10000 },
];

const coffeeToppings: Topping[] = [
  { id: "shot", name: "Thêm shot espresso", price: 10000 },
  { id: "cream", name: "Kem sữa", price: 8000 },
  { id: "coffee-jelly", name: "Thạch cà phê", price: 7000 },
];

const teaToppings: Topping[] = [
  { id: "pearl", name: "Trân châu trắng", price: 8000 },
  { id: "peach", name: "Đào miếng", price: 10000 },
  { id: "cream", name: "Kem sữa", price: 8000 },
];

export const products: Product[] = [
  {
    id: "ca-phe-sua",
    name: "Cà phê sữa BrewLite",
    category: "Cà phê",
    description: "Cà phê rang đậm, sữa đặc và lớp bọt mịn theo công thức đặc trưng.",
    imageUrl:
      "https://images.unsplash.com/photo-1749105504681-1889a810be41?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    basePrice: 39000,
    badge: "Bán chạy",
    sizes,
    toppings: coffeeToppings,
  },
  {
    id: "americano",
    name: "Americano",
    category: "Cà phê",
    description: "Hai shot espresso cân bằng với nước nóng, thơm sâu và thanh nhẹ.",
    imageUrl:
      "https://images.unsplash.com/photo-1598778124054-f9548b4d5e4c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    basePrice: 42000,
    sizes,
    toppings: coffeeToppings,
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    category: "Cà phê",
    description: "Espresso, sữa nóng và bọt sữa dày, phủ một lớp cacao dịu nhẹ.",
    imageUrl:
      "https://images.unsplash.com/photo-1571263773557-7788164a8ad7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    basePrice: 49000,
    badge: "Đậm vị",
    sizes,
    toppings: coffeeToppings,
  },
  {
    id: "bac-xiu",
    name: "Bạc xỉu kem muối",
    category: "Cà phê",
    description: "Vị sữa béo dịu hòa cùng cà phê và kem muối mằn mặn hấp dẫn.",
    imageUrl:
      "https://images.unsplash.com/photo-1749105862041-d7e03c78eccb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    basePrice: 45000,
    badge: "Mới",
    sizes,
    toppings: coffeeToppings,
  },
  {
    id: "cold-brew",
    name: "Cold brew cam sả",
    category: "Cà phê",
    description: "Cold brew ủ lạnh 16 giờ, thêm cam vàng và sả cho hậu vị tươi mát.",
    imageUrl:
      "https://images.unsplash.com/photo-1745816743825-b1be5b23e528?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    basePrice: 52000,
    sizes,
    toppings: coffeeToppings,
  },
  {
    id: "tra-dao",
    name: "Trà đào cam sả",
    category: "Trà",
    description: "Trà đen thanh mát, đào giòn, cam vàng và hương sả tự nhiên.",
    imageUrl:
      "https://images.unsplash.com/photo-1751033390130-cdc5a6082089?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    basePrice: 45000,
    badge: "Tươi mát",
    sizes,
    toppings: teaToppings,
  },
  {
    id: "matcha",
    name: "Matcha latte",
    category: "Trà",
    description: "Matcha Nhật Bản thơm thanh, quyện cùng sữa tươi béo nhẹ.",
    imageUrl:
      "https://images.unsplash.com/photo-1749280447307-31a68eb38673?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    basePrice: 52000,
    badge: "Yêu thích",
    sizes,
    toppings: teaToppings,
  },
  {
    id: "chocolate",
    name: "Chocolate đá xay",
    category: "Đá xay",
    description: "Chocolate đậm đà xay mịn cùng sữa và phủ kem tươi mềm mượt.",
    imageUrl:
      "https://images.unsplash.com/photo-1629644087983-c85380e0b543?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    basePrice: 55000,
    sizes,
    toppings: coffeeToppings,
  },
];

export const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export const getProduct = (productId: string) =>
  products.find((product) => product.id === productId);

export const getUnitPrice = (
  product: Product,
  sizeId: SizeOption["id"],
  toppingIds: string[],
) => {
  const sizeDelta = product.sizes.find((size) => size.id === sizeId)?.delta ?? 0;
  const toppingTotal = product.toppings
    .filter((topping) => toppingIds.includes(topping.id))
    .reduce((total, topping) => total + topping.price, 0);
  return product.basePrice + sizeDelta + toppingTotal;
};
