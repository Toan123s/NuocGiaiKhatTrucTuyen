// TV3 điều phối file dùng chung. Mỗi TV thêm controller/service/model của phần mình khi hoàn thiện, báo nhóm trước khi sửa providers.
import { Module } from "@nestjs/common";
import { DatabaseService } from "./config/db";
import { ProductsController } from "./controllers/customer/products.controller";
import { ProductsService } from "./services/products.service";
import { ProductModel } from "./models/product.model";
import { HealthController } from "./controllers/system/health.controller";
import { AuthController } from "./controllers/auth/auth.controller";
import { OrdersController } from "./controllers/customer/orders.controller";
import { PaymentsController } from "./controllers/customer/payments.controller";
import { CustomerOrdersController } from "./controllers/customer/customer-orders.controller";
@Module({
  controllers: [
    ProductsController,
    HealthController,
    AuthController,
    CustomerOrdersController,
    OrdersController,
    PaymentsController,
  ],
  providers: [DatabaseService, ProductModel, ProductsService],
})
export class AppModule {}
