import { useEffect, useState } from "react";
import { usePersistentState } from "./hooks/usePersistentState";
import { addCartItem, getCartCount } from "./domain/cart";
import { createOrder } from "./domain/orders";
import type { AppView, CartItem, Order, PaymentMethod, Product, UserSession, SizeOption } from "./types";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Hero from "./components/menu/Hero";
import MenuSection from "./components/menu/MenuSection";
import ProductCustomizer from "./components/order/ProductCustomizer";
import CartDrawer from "./components/order/CartDrawer";
import AuthDialog from "./components/auth/AuthDialog";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import { CheckIcon } from "./shared/icons";

export default function App() {
  const [cart, setCart] = usePersistentState<CartItem[]>("brewlite:cart", []);
  const [orders, setOrders] = usePersistentState<Order[]>("brewlite:orders", []);
  const [session, setSession] = usePersistentState<UserSession | null>("brewlite:session", null);
  const [view, setView] = useState<AppView>("menu");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const cartCount = getCartCount(cart);
  const lastOrder = orders.find((order) => order.id === lastOrderId) ?? orders.at(-1);

  useEffect(() => {
    const modalOpen = Boolean(selectedProduct || isCartOpen || isAuthOpen);
    document.body.classList.toggle("no-scroll", modalOpen);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setSelectedProduct(null); setCartOpen(false); setAuthOpen(false); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.classList.remove("no-scroll"); window.removeEventListener("keydown", onKeyDown); };
  }, [selectedProduct, isCartOpen, isAuthOpen]);

  useEffect(() => { if (!toast) return; const timeout = window.setTimeout(() => setToast(""), 2400); return () => window.clearTimeout(timeout); }, [toast]);

  const goMenu = () => { setView("menu"); window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0); };
  const goHistory = () => { setView("history"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const beginCheckout = () => { if (!cart.length) return; setCartOpen(false); if (!session) { setAuthOpen(true); return; } setView("checkout"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const addToCart = (sizeId: SizeOption["id"], toppingIds: string[], quantity: number) => { if (!selectedProduct) return; setCart((current) => addCartItem(current, selectedProduct, sizeId, toppingIds, quantity)); setSelectedProduct(null); setToast(`Đã thêm ${selectedProduct.name} vào giỏ`); };
  const pay = async (paymentMethod: PaymentMethod, subtotal: number, serviceFee: number) => { await new Promise((resolve) => window.setTimeout(resolve, 900)); const order = createOrder(cart, paymentMethod, subtotal, serviceFee); setOrders((current) => [...current, order]); setCart([]); setLastOrderId(order.id); setView("confirmation"); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return <div className="app"><Header cartCount={cartCount} onCart={() => setCartOpen(true)} onHistory={goHistory} onMenu={goMenu} session={session} />
    {view === "menu" && <main><Hero onExplore={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })} /><MenuSection onSelect={setSelectedProduct} /><section className="benefits shell"><div><span>01</span><h3>Chọn món đúng gu</h3><p>Tùy chỉnh size và topping theo cách riêng của bạn.</p></div><div><span>02</span><h3>Thanh toán một chạm</h3><p>Ví điện tử hoặc thẻ — nhanh chóng và bảo mật.</p></div><div><span>03</span><h3>Nhận ngay tại quầy</h3><p>Không xếp hàng, chỉ cần đến và mang ly ngon đi.</p></div></section></main>}
    {view === "checkout" && session && <CheckoutPage items={cart} onBack={goMenu} onPay={pay} session={session} />}
    {view === "confirmation" && lastOrder && <OrderConfirmationPage onHistory={goHistory} onMenu={goMenu} order={lastOrder} />}
    {view === "history" && <OrderHistoryPage onMenu={goMenu} orders={orders} />}
    <Footer onHistory={goHistory} onMenu={goMenu} />
    {selectedProduct && <ProductCustomizer onAdd={addToCart} onClose={() => setSelectedProduct(null)} product={selectedProduct} />}
    {isCartOpen && <CartDrawer items={cart} onCheckout={beginCheckout} onClose={() => setCartOpen(false)} onQuantity={(key, quantity) => setCart((current) => current.map((item) => item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item))} onRemove={(key) => setCart((current) => current.filter((item) => item.key !== key))} />}
    {isAuthOpen && <AuthDialog onClose={() => setAuthOpen(false)} onLogin={(user) => { setSession(user); setAuthOpen(false); setView("checkout"); window.scrollTo({ top: 0, behavior: "smooth" }); }} />}
    {toast && <div className="toast" role="status"><span><CheckIcon size={16} /></span>{toast}</div>}
  </div>;
}
