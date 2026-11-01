import { Body, Controller, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { CUSTOMER_ROUTES } from "../../routes/customer.routes";
import { CurrentUser } from "../../guards/current-user.decorator";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { OrdersService } from "../../services/orders.service";
import type { AuthenticatedUser } from "../../types/auth.types";
import type { CreateOrderInput } from "../../types/contracts";

// LƯU Ý TV4: mới có đặt đơn và hủy đơn. CHƯA có route xem giá tạm (OrdersService.previewOrder) vì cần chốt
// request/response với TV2 và TV1 rồi thêm vào routes/customer.routes.ts (file chung).
// Route thử lại thanh toán (preparePaymentRetry) thuộc TV5. CustomerOrdersController (TV6) dùng chung đường dẫn
// gốc "orders" nhưng khác route.
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