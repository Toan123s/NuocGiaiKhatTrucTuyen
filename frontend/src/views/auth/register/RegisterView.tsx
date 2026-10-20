// THÀNH VIÊN 3 — Đăng ký. File khung, chưa có nghiệp vụ.
// Trang: /register
// TODO TV3: submitRegister(email, password); validate; gọi POST /auth/register; không cho tự chọn vai trò.
// Hoàn thiện component này; route app chỉ import view, không đặt SQL/secret trong frontend.
import { PendingPage } from "@/components/common/PendingPage";
export function RegisterView() {
  return <PendingPage title="Đăng ký" />;
}
