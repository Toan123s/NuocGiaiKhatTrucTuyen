// THÀNH VIÊN 2 — Xác nhận đặt đơn. File khung, chưa có nghiệp vụ.
// Trang: /checkout
// TODO TV2: loadCheckout(), submitOrder(); làm UI xác nhận món, tổng tạm, lỗi, trạng thái gửi; giữ giỏ khi login qua TV3.
// Gắn PromotionInput do TV1 phụ trách; chỉ gửi productId/size/toppingIds/quantity/promotionCode.
// Gọi POST /orders của TV4; hiển thị total chính thức rồi sang /payment?orderId=... của TV5. Không viết SQL/transaction hoặc tự gán PAID trong view.
// Hoàn thiện component này; route app chỉ import view, không đặt SQL/secret trong frontend.
import { PendingPage } from "@/components/common/PendingPage";
export function CheckoutView() {
  return <PendingPage title="Xác nhận đặt đơn" />;
}
