// THÀNH VIÊN 6 — Kết quả thanh toán. File khung, chưa có nghiệp vụ.
// Trang: /payment-status
// TODO TV6: checkPaymentStatus(paymentId), pollPaymentStatus(), stopPolling(); gọi GET /payments/:id của TV5 bằng JWT TV3.
// Hiển thị PROCESSING/FAILED/SUCCEEDED, dựa response backend xác nhận đơn PAID; chỉ khi đó gọi CartStore.clearAfterPayment của TV2.
// Dừng polling khi có kết quả hoặc unmount; không tin status trên URL, không tự gán PAID. Nút thử lại chuyển về luồng TV5.
// Hoàn thiện component này; route app chỉ import view, không đặt SQL/secret trong frontend.
import { PendingPage } from "@/components/common/PendingPage";
export function PaymentStatusView() {
  return <PendingPage title="Kết quả thanh toán" />;
}
