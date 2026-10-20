// TV5 — Model Payment: NƠI VIẾT SQL, không đặt logic giao diện/HTTP tại đây.
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
export class PaymentModel {
  // TODO TV5: SELECT attempt theo unique key; PaymentsService so hash payload, không log token.
  findByKey(key: string): never {
    throw new NotImplementedException(
      "TV5: PaymentModel.findByKey chưa triển khai",
    );
  }
  // TODO TV5: INSERT PROCESSING; unique key và kiểm soát một PROCESSING/SUCCEEDED mỗi đơn.
  insertAttempt(
    userId: string,
    input: PaymentInput,
    key: string,
    payloadHash: string,
    transaction: PoolClient,
  ): never {
    throw new NotImplementedException(
      "TV5: PaymentModel.insertAttempt chưa triển khai",
    );
  }
  // TODO TV5: SELECT attempt kèm owner để service kiểm tra JWT; /payment-status.
  findById(paymentId: string): never {
    throw new NotImplementedException(
      "TV5: PaymentModel.findById chưa triển khai",
    );
  }
  // TODO TV5: UPDATE kết quả xác định; UNKNOWN giữ PROCESSING; dùng transaction chốt đơn/điểm.
  updateResult(
    paymentId: string,
    result: PaymentResult,
    transaction: PoolClient,
  ): never {
    throw new NotImplementedException(
      "TV5: PaymentModel.updateResult chưa triển khai",
    );
  }
}
