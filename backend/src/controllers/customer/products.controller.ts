import { CUSTOMER_ROUTES } from "../../routes/customer.routes";
// TV1 — GET /products đã chạy; detail để TODO theo phạm vi bộ khung.
import {
  BadRequestException,
  Inject,
  Controller,
  Get,
  Param,
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
  @Get(CUSTOMER_ROUTES.products.detail)
  getProductDetail(@Param("id") id: string) {
    if (!id.trim()) {
      throw new BadRequestException("Thiếu mã sản phẩm.");
    }
    return this.service.getProductDetail(id);
  }
}
