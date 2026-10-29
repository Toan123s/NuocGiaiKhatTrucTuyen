import { AUTH_ROUTES } from "../../routes/auth.routes";
// TV3 — POST /auth/register, POST /auth/login, GET /auth/me. Controller chỉ nhận request và gọi service, không chứa nghiệp vụ.
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../../guards/current-user.decorator";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { AuthService } from "../../services/auth.service";
import { UsersService } from "../../services/users.service";
import type { AuthenticatedUser } from "../../types/auth.types";
@Controller(AUTH_ROUTES.base)
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(UsersService) private readonly users: UsersService,
  ) {}
  @Post(AUTH_ROUTES.register)
  async register(@Body() body: unknown) {
    return { user: await this.auth.register(body) };
  }
  @Post(AUTH_ROUTES.login)
  @HttpCode(200)
  login(@Body() body: unknown) {
    return this.auth.login(body);
  }
  @Get(AUTH_ROUTES.me)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthenticatedUser) {
    return { user: await this.users.getCurrentUser(user.id) };
  }
}
