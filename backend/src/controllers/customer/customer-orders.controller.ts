// TV6 — GET /orders/me và GET /orders/:id (chỉ đơn của chính user).
// URL lấy từ routes/customer.routes.ts. Controller chỉ nhận request và gọi service.
//
// Thứ tự khai báo QUAN TRỌNG: "me" phải đứng trước ":id", nếu không "me" bị hiểu là mã đơn.
// CustomerOrdersController phải đứng trước OrdersController (TV4) trong app.module.ts (hiện đã đúng).
//
// TV3 TODO: khi có JwtAuthGuard, thêm @UseGuards(JwtAuthGuard) ở class và guard phải gán
// request.user = { id } từ JWT đã xác minh. Chưa có guard thì currentUserId() ném 401 => API đóng,
// không trả dữ liệu của ai.
import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { CUSTOMER_ROUTES } from "../../routes/customer.routes";
import { CustomerOrdersService } from "../../services/customer-orders.service";
import type {
  OrderDetail,
  OrderListPage,
} from "../../types/customer-order.types";

interface AuthenticatedRequest {
  user?: { id?: unknown };
}

function currentUserId(req: AuthenticatedRequest): string {
  const id = req.user?.id;
  if (typeof id !== "string" || id === "") throw new UnauthorizedException();
  return id;
}

@Controller(CUSTOMER_ROUTES.orders.base)
export class CustomerOrdersController {
  constructor(
    @Inject(CustomerOrdersService)
    private readonly service: CustomerOrdersService,
  ) {}

  @Get(CUSTOMER_ROUTES.orders.mine)
  mine(
    @Req() req: AuthenticatedRequest,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ): Promise<OrderListPage> {
    return this.service.getMyOrders(currentUserId(req), limit, offset);
  }

  @Get(CUSTOMER_ROUTES.orders.detail)
  detail(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<OrderDetail> {
    return this.service.getOrderDetail(currentUserId(req), id);
  }
}
