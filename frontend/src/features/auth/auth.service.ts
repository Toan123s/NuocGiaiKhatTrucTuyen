// TV3 — Gắn /login, /register; API chưa triển khai, không lưu tài khoản giả.
export class AuthClient {
  register(email: string, password: string): never {
    throw new Error("TODO TV3: register qua POST /auth/register");
  }
  login(email: string, password: string): never {
    throw new Error("TODO TV3: login qua POST /auth/login");
  }
  logout(): never {
    throw new Error("TODO TV3: xóa phiên và về menu");
  }
  // TODO TV3: giữ returnUrl nội bộ, chống open redirect; không làm mất giỏ.
  handleSessionExpired(): never {
    throw new Error("TODO TV3: handleSessionExpired");
  }
}
