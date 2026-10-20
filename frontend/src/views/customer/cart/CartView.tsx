// THÀNH VIÊN 2 — Giỏ hàng. File khung, chưa có nghiệp vụ.
// Trang: /cart
// TODO TV2: addItem(), updateQuantity(), removeItem(), calculateSubtotal(); giữ giỏ qua login; đi /checkout do TV2 làm.
// Gắn PromotionInput của TV1 và truyền promotionCode; không viết lại công thức giảm giá. Tổng tạm chỉ để hiển thị, TV4 tính lại tổng chính thức.
// Hoàn thiện component này; route app chỉ import view, không đặt SQL/secret trong frontend.
import { PendingPage } from "@/components/common/PendingPage";
export function CartView() {
  return <PendingPage title="Giỏ hàng" />;
}
