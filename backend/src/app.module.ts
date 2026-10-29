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
import { UserModel } from "./models/user.model";
import { UsersService } from "./services/users.service";
import { AuthService } from "./services/auth.service";
import { PromotionModel } from "./models/promotion.model";
import { PromotionsService } from "./services/promotions.service";
import { SepayController } from "./sepay/sepay.controller";
import { SepayModel } from "./sepay/sepay.model";
import { SepayService } from "./sepay/sepay.services";
import { OrderModel } from "./models/order.model";
import { InventoryModel } from "./models/inventory.model";
import { OrdersService } from "./services/orders.service";
import { InventoryService } from "./services/inventory.service";
@Module({
  controllers: [
    ProductsController,
    HealthController,
    AuthController,
    CustomerOrdersController,
    OrdersController,
    PaymentsController,
    SepayController,
  ],
  providers: [
    DatabaseService,
    ProductModel,
    ProductsService,
    PromotionModel,
    PromotionsService,
    SepayModel,
    SepayService,
    OrderModel,
    InventoryModel,
    OrdersService,
    InventoryService,
  ],
  providers: [
    DatabaseService,
    ProductModel,
    ProductsService,
    UserModel,
    UsersService,
    AuthService,
  ],
})
export class AppModule {}
