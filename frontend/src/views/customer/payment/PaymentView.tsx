// THÀNH VIÊN 5 — Thanh toán. File khung, chưa có nghiệp vụ.
// Trang: /payment
// TODO TV5: selectMethod(), submitPayment(), retryPayment(); nhận orderId/total chính thức từ checkout TV2 qua API TV4.
// Key theo lần thử, không đổi key khi chỉ gửi lại request; phối hợp TV4 giữ tồn lại sau FAILED. Sang /payment-status do TV6 làm, không xóa giỏ khi PROCESSING/FAILED.
// Hoàn thiện component này; route app chỉ import view, không đặt SQL/secret trong frontend.
import { PendingPage } from "@/components/common/PendingPage";
export function PaymentView() {
  return <PendingPage title="Thanh toán" />;
}
