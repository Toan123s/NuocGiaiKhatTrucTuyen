import { CUSTOMER_ROUTES } from "../../routes/customer.routes";
// TV1 — GET /products đã chạy; detail để TODO theo phạm vi bộ khung.
import {
  Inject,
  Controller,
  Get,
  Param,
  NotImplementedException,
} from "@nestjs/common";
import { ProductsService } from "../../services/products.service";
@Controller(CUSTOMER_ROUTES.products.base)
export class ProductsController {
  constructor(
    @Inject(ProductsService) private readonly service: ProductsService,
  ) {}
  @Get(CUSTOMER_ROUTES.products.list) getProducts() {
    return this.service.getProducts();
  }
  @Get(CUSTOMER_ROUTES.products.detail) getProductDetail(
    @Param("id") _id: string,
  ): never {
    // TODO TV1: validate id, service.getProductDetail → model.findById; 404 nếu không có.
    throw new NotImplementedException("Chi tiết sản phẩm chưa triển khai");
  }
}
