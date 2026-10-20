import { CUSTOMER_ROUTES } from "../../routes/customer.routes";
// TV6 — Route được nối sẵn, hiện luôn trả 501; chưa có Auth hay nghiệp vụ.
import { Controller, Get, Post, NotImplementedException } from "@nestjs/common";
@Controller(CUSTOMER_ROUTES.orders.base)
export class CustomerOrdersController {
  @Get(CUSTOMER_ROUTES.orders.mine)
  getMyOrders(): never {
    // TODO TV6: /orders; JWT của khách hiện tại; inject service tương ứng khi triển khai.
    throw new NotImplementedException("getMyOrders chưa triển khai");
  }
  @Get(CUSTOMER_ROUTES.orders.detail)
  getOrderDetail(): never {
    // TODO TV6: /orders/[id]; kiểm tra chủ đơn; inject service tương ứng khi triển khai.
    throw new NotImplementedException("getOrderDetail chưa triển khai");
  }
}
