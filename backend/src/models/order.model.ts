// TV4 — Model Order: NƠI VIẾT SQL, không đặt logic giao diện/HTTP tại đây.
// Chưa triển khai. Service cùng tên nghiệp vụ sẽ gọi model; SQL luôn dùng tham số $1, $2...
import { Injectable, NotImplementedException } from "@nestjs/common";
import type {
  PoolClient,
  OrderLine,
  OrderStatus,
  PaymentInput,
  PaymentResult,
} from "../types/contracts";
@Injectable()
export class OrderModel {
  // TODO TV4: INSERT Order PENDING và hạn giữ tồn trong client transaction; /checkout.
  insertOrder(userId: string, total: number, transaction: PoolClient): never {
    throw new NotImplementedException(
      "TV4: OrderModel.insertOrder chưa triển khai",
    );
  }
  // TODO TV4: INSERT chi tiết với snapshot đơn giá/size/topping do service đã chốt; bổ sung DTO snapshot trước khi làm.
  // Phải dùng đúng PoolClient đã INSERT order trong cùng transaction; 002 sẽ chặn ghi chi tiết sau commit. UI checkout thuộc TV2.
  insertOrderItems(
    orderId: string,
    items: OrderLine[],
    transaction: PoolClient,
  ): never {
    throw new NotImplementedException(
      "TV4: OrderModel.insertOrderItems chưa triển khai",
    );
  }
  // TODO TV4: SELECT đơn FOR UPDATE trước khi hủy/thanh toán, tránh tranh trạng thái.
  findForUpdate(orderId: string, transaction: PoolClient): never {
    throw new NotImplementedException(
      "TV4: OrderModel.findForUpdate chưa triển khai",
    );
  }
  // TODO TV4: UPDATE có WHERE trạng thái hiện tại, kiểm tra số dòng; service kiểm tra cạnh chuyển.
  updateStatus(
    orderId: string,
    from: OrderStatus,
    to: OrderStatus,
    transaction: PoolClient,
  ): never {
    throw new NotImplementedException(
      "TV4: OrderModel.updateStatus chưa triển khai",
    );
  }
  // TODO TV4: SELECT PENDING quá hạn chưa có Payment PROCESSING, phục vụ job TV4.
  findExpiredPendingOrders(transaction: PoolClient): never {
    throw new NotImplementedException(
      "TV4: OrderModel.findExpiredPendingOrders chưa triển khai",
    );
  }
}
