import { AUTH_ROUTES } from "../../routes/auth.routes";
// TV3 — Route được nối sẵn, hiện luôn trả 501; chưa có Auth hay nghiệp vụ.
import { Controller, Get, Post, NotImplementedException } from "@nestjs/common";
@Controller(AUTH_ROUTES.base)
export class AuthController {
  @Post(AUTH_ROUTES.register)
  register(): never {
    // TODO TV3: Đăng ký từ /register; inject service tương ứng khi triển khai.
    throw new NotImplementedException("register chưa triển khai");
  }
  @Post(AUTH_ROUTES.login)
  login(): never {
    // TODO TV3: Đăng nhập từ /login; inject service tương ứng khi triển khai.
    throw new NotImplementedException("login chưa triển khai");
  }
}
