import { CUSTOMER_ROUTES } from "../../routes/customer.routes";
// TV4 — Route được nối sẵn, hiện luôn trả 501; chưa có Auth hay nghiệp vụ.
import { Controller, Get, Post, NotImplementedException } from "@nestjs/common";
@Controller(CUSTOMER_ROUTES.orders.base)
export class OrdersController {
  @Post(CUSTOMER_ROUTES.orders.create)
  createOrder(): never {
    // TODO TV4: API nhận request từ /checkout do TV2 làm. JWT của TV3, validate DTO, gọi OrdersService; module khuyến mãi do TV1 cung cấp.
    // Trả total chính thức và orderId cho TV2; inject service/model, giữ 501 cho tới khi đủ kiểm tra.
    throw new NotImplementedException("createOrder chưa triển khai");
  }
  @Post(CUSTOMER_ROUTES.orders.cancel)
  cancelOrder(): never {
    // TODO TV4: /orders/[id]; JWT, chủ đơn và trạng thái; inject service tương ứng khi triển khai.
    throw new NotImplementedException("cancelOrder chưa triển khai");
  }
}
