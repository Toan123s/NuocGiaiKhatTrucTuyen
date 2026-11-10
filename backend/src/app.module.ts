// TV3 điều phối file dùng chung.
import { Module } from "@nestjs/common";
import { DatabaseService } from "./config/db.js";
import { LoyaltyModel } from "./models/loyalty.model.js";
import { MockPaymentGateway } from "./gateways/mock-payment.gateway.js"; 
import { LoyaltyService } from "./services/loyalty.service.js"; 
import { ProductsController } from "./controllers/customer/products.controller.js";
import { HealthController } from "./controllers/system/health.controller.js";
import { AuthController } from "./controllers/auth/auth.controller.js";
import { OrdersController } from "./controllers/customer/orders.controller.js";
import { PaymentsController } from "./controllers/customer/payments.controller.js";
import { CustomerOrdersController } from "./controllers/customer/customer-orders.controller.js";
import { CustomerOrderModel } from "./models/customer-order.model.js";
import { OrderStateService } from "./services/order-state.service.js";
import { CustomerOrdersService } from "./services/customer-orders.service.js";
import { ProductsService } from "./services/products.service.js";
import { OrdersService } from "./services/orders.service.js";
import { UsersService } from "./services/users.service.js";
import { AuthService } from "./services/auth.service.js";
import { PromotionsService } from "./services/promotions.service.js";
import { InventoryService } from "./services/inventory.service.js";
import { ProductModel } from "./models/product.model.js";
import { UserModel } from "./models/user.model.js";
import { OrderModel } from "./models/order.model.js";
import { PromotionModel } from "./models/promotion.model.js";
import { InventoryModel } from "./models/inventory.model.js";
import { PaymentModel } from "./models/payment.model.js";
import { PaymentsService } from "./services/payments.service.js";


@Module({
  controllers: [
    ProductsController,
    HealthController,
    AuthController,
    CustomerOrdersController,
    OrdersController,
    PaymentsController,
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
    CustomerOrdersService,
    CustomerOrderModel,
    OrderStateService,
    LoyaltyModel,       
    LoyaltyService,     
    MockPaymentGateway,
    PaymentModel,
    PaymentsService,
  ]
})
export class AppModule {}
