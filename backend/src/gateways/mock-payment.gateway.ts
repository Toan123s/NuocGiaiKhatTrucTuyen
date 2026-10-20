// TV5 — Cổng mô phỏng, KHÔNG tích hợp tiền thật.
import { NotImplementedException } from "@nestjs/common";
export class MockPaymentGateway {
  // TODO TV5: mô phỏng SUCCESS/FAILED/TIMEOUT có thể điều khiển khi test; lưu kết quả theo key.
  charge(
    orderId: string,
    amount: number,
    method: "WALLET" | "CARD",
    key: string,
  ): never {
    throw new NotImplementedException("TV5: charge chưa triển khai");
  }
  // TODO TV5: đối soát cùng key; không tạo lần thu mới.
  lookupByKey(key: string): never {
    throw new NotImplementedException("TV5: lookupByKey chưa triển khai");
  }
}
