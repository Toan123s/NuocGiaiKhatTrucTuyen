// THÀNH VIÊN 6 — Chi tiết đơn. File khung, chưa có nghiệp vụ.
// Trang: /orders/[id]
// TODO TV6: loadOrder(id), cancelOrder(id); GET /orders/:id chỉ đơn của mình bằng JWT TV3.
// Nút hủy gọi POST /orders/:id/cancel của TV4 và tải lại trạng thái; không tự cập nhật DB/hoàn tồn. Backend trả 409 thì hiển thị trạng thái mới cho khách.
// Hoàn thiện component này; route app chỉ import view, không đặt SQL/secret trong frontend.
import { PendingPage } from "@/components/common/PendingPage";
export function OrderDetailView() {
  return <PendingPage title="Chi tiết đơn" />;
}
