
 // TV3 điều phối file dùng chung.
import { Module } from "@nestjs/common";
import { DatabaseService } from "./config/db";

import { ProductsController } from "./controllers/customer/products.controller";
import { HealthController } from "./controllers/system/health.controller";
import { AuthController } from "./controllers/auth/auth.controller";
import { OrdersController } from "./controllers/customer/orders.controller";
import { PaymentsController } from "./controllers/customer/payments.controller";
import { CustomerOrdersController } from "./controllers/customer/customer-orders.controller";

import { ProductsService } from "./services/products.service";
import { OrdersService } from "./services/orders.service";
import { UsersService } from "./services/users.service";
import { AuthService } from "./services/auth.service";
import { PromotionsService } from "./services/promotions.service";
import { InventoryService } from "./services/inventory.service";

import { ProductModel } from "./models/product.model";
import { UserModel } from "./models/user.model";
import { OrderModel } from "./models/order.model";
import { PromotionModel } from "./models/promotion.model";
import { InventoryModel } from "./models/inventory.model";

import { SepayController } from "./sepay/sepay.controller";
import { SepayModel } from "./sepay/sepay.model";
import { SepayService } from "./sepay/sepay.services";

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
    UserModel,
    UsersService,
    AuthService,
    OrderModel,
    OrdersService,
    PromotionModel,
    PromotionsService,
    InventoryModel,
    InventoryService,
    SepayModel,
    SepayService,
  ],
})
export class AppModule {}
