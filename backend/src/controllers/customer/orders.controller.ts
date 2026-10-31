import { Body, Controller, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { CUSTOMER_ROUTES } from "../../routes/customer.routes";
import { CurrentUser } from "../../guards/current-user.decorator";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { OrdersService } from "../../services/orders.service";
import type { AuthenticatedUser } from "../../types/auth.types";
import type { CreateOrderInput } from "../../types/contracts";

@Controller(CUSTOMER_ROUTES.orders.base)
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    @Inject(OrdersService) private readonly ordersService: OrdersService,
  ) {}

  @Post(CUSTOMER_ROUTES.orders.create)
  createOrder(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateOrderInput) {
    return this.ordersService.createOrder(user.id, body);
  }

  @Post(CUSTOMER_ROUTES.orders.cancel)
  cancelOrder(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.ordersService.cancelOrder(user.id, id);
  }
}