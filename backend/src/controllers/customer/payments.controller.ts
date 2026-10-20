import { CUSTOMER_ROUTES } from "../../routes/customer.routes";
// TV5 — Route được nối sẵn, hiện luôn trả 501; chưa có Auth hay nghiệp vụ.
import { Controller, Get, Post, NotImplementedException } from "@nestjs/common";
@Controller(CUSTOMER_ROUTES.payments.base)
export class PaymentsController {
  @Post(CUSTOMER_ROUTES.payments.create)
  createPayment(): never {
    // TODO TV5: /payment; JWT và Idempotency-Key; inject service tương ứng khi triển khai.
    throw new NotImplementedException("createPayment chưa triển khai");
  }
  @Get(CUSTOMER_ROUTES.payments.status)
  getPaymentStatus(): never {
    // TODO TV5: /payment-status; JWT và chủ đơn; inject service tương ứng khi triển khai.
    throw new NotImplementedException("getPaymentStatus chưa triển khai");
  }
}
