// TV1 — Menu đã hoạt động; hoàn thiện getProductDetail(id) bằng ProductModel.findById và 404 khi không có.
// TODO TV1: nối getProductDetail vào ProductsController cho /products/[id]; giữ giá chốt đơn ở service TV4.
import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ProductModel } from "../models/product.model";
@Injectable()
export class ProductsService {
  constructor(@Inject(ProductModel) private readonly model: ProductModel) {}
  async getProducts() {
    try {
      return await this.model.findAll();
    } catch {
      throw new ServiceUnavailableException(
        "Không tải được menu. Kiểm tra database và chạy migration/seed.",
      );
    }
  }
}
