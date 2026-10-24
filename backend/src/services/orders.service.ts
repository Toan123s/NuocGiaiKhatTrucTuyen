// TV4 — Orders service: tạo, hủy, hết hạn giữ tồn, chuẩn bị thanh toán lại.
// Điều phối transaction qua DatabaseService.withTransaction; SQL nằm ở OrderModel/InventoryModel.
import { randomUUID } from "crypto";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import { DatabaseService } from "../config/db";
import { OrderModel } from "../models/order.model";
import { InventoryService } from "./inventory.service";
import { calculateUnitPrice } from "./order-pricing";
import type { CreateOrderInput } from "../types/contracts";
import type { NewOrderItem } from "../types/order.types";

@Injectable()
export class OrdersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly orderModel: OrderModel,
    private readonly inventoryService: InventoryService,
  ) { }

  // TODO TV4: previewOrder (xem giá tạm, không ghi DB). Chưa có route riêng; thống nhất request/response với TV1 và TV2 trước.
  previewOrder(userId: string, input: CreateOrderInput): never {
    throw new NotImplementedException("TV4: previewOrder chưa triển khai");
  }

  // Tạo đơn PENDING + chi tiết + giữ tồn trong một transaction. Khuyến mãi (TV1) chưa nối: discount = 0.
  async createOrder(userId: string, input: CreateOrderInput) {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException("Đơn hàng phải có ít nhất một món");
    }
    for (const line of input.items) {
      if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) {
        throw new BadRequestException(
          `Số lượng của sản phẩm ${line.productId} phải là số nguyên từ 1 đến 99`,
        );
      }
    }
    return this.db.withTransaction(async (client) => {
      // Bước 1: đọc giá từ DB, không tin giá client
      const productIds = [...new Set(input.items.map((i) => i.productId))];
      const products = await this.orderModel.findForPricing(productIds, client);

      // Bước 2: tính từng dòng chi tiết
      const orderId = randomUUID();
      const orderItems: NewOrderItem[] = input.items.map((line) => {
        const product = products.find((p) => p.id === line.productId);
        if (!product) {
          throw new BadRequestException(`Sản phẩm ${line.productId} không tồn tại`);
        }
        const unitPrice = calculateUnitPrice(product, line.size, line.toppingIds);
        return {
          id: randomUUID(),
          productId: line.productId,
          productName: product.name,
          size: line.size,
          toppingIds: line.toppingIds,
          quantity: line.quantity,
          unitPrice,
          lineTotal: unitPrice * line.quantity,
        };
      });

      // Bước 3: tổng tiền
      const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const discount = 0;
      const total = subtotal - discount;

      // Bước 4: giữ tồn (ném lỗi nếu hết hàng, withTransaction sẽ rollback)
      await this.inventoryService.reserveStock(input.items, client);

      // Bước 5: ghi đơn rồi ghi chi tiết, cùng một client
      const order = await this.orderModel.insertOrder(
        { id: orderId, userId, subtotal, discount, total, promotionId: null },
        client,
      );
      await this.orderModel.insertOrderItems(order.id, orderItems, client);

      return {
        orderId: order.id,
        status: order.status,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
      };
    });
  }

  // Hủy đơn của chính người dùng; hoàn tồn cùng transaction (trigger 002 đòi CANCELLED phải có stock_released = true).
  async cancelOrder(userId: string, orderId: string) {
    return this.db.withTransaction(async (client) => {
      const order = await this.orderModel.findForUpdate(orderId, client);

      if (order === null || order.userId !== userId) {
        throw new NotFoundException("Không tìm thấy đơn hàng");
      }
      if (order.status !== "PENDING" && order.status !== "PAYMENT_FAILED") {
        throw new ConflictException(
          `Không thể hủy đơn đang ở trạng thái ${order.status}`,
        );
      }
      if (await this.orderModel.hasProcessingPayment(orderId, client)) {
        throw new ConflictException("Đơn đang có thanh toán xử lý, chưa thể hủy");
      }

      const changed = await this.orderModel.updateStatus(
        orderId,
        order.status,
        "CANCELLED",
        client,
      );
      if (!changed) {
        throw new ConflictException("Trạng thái đơn vừa thay đổi, hãy tải lại");
      }

      await this.inventoryService.releaseStock(orderId, client);

      return { orderId, status: "CANCELLED" as const };
    });
  }

  // Job hủy đơn PENDING quá hạn; mỗi đơn một transaction. Chưa có lịch gọi hàm này.
  async expirePendingOrders(): Promise<number> {
    const expiredIds = await this.db.withTransaction((client) =>
      this.orderModel.findExpiredPendingOrders(client),
    );

    let cancelled = 0;
    for (const orderId of expiredIds) {
      try {
        await this.db.withTransaction(async (client) => {
          const order = await this.orderModel.findForUpdate(orderId, client);
          if (order === null || order.status !== "PENDING") {
            return;
          }
          if (await this.orderModel.hasProcessingPayment(orderId, client)) {
            return;
          }
          const changed = await this.orderModel.updateStatus(
            orderId,
            "PENDING",
            "CANCELLED",
            client,
          );
          if (!changed) {
            return;
          }
          await this.inventoryService.releaseStock(orderId, client);
          cancelled++;
        });
      } catch (error) {
        console.error(`Hết hạn đơn ${orderId} thất bại`, error);
      }
    }
    return cancelled;
  }

  // PAYMENT_FAILED -> PENDING: giữ tồn mới trước, hết hàng thì rollback và đơn vẫn PAYMENT_FAILED.
  async preparePaymentRetry(userId: string, orderId: string) {
    return this.db.withTransaction(async (client) => {
      const order = await this.orderModel.findForUpdate(orderId, client);

      if (order === null || order.userId !== userId) {
        throw new NotFoundException("Không tìm thấy đơn hàng");
      }
      if (order.status !== "PAYMENT_FAILED") {
        throw new ConflictException(
          `Chỉ thử lại được đơn PAYMENT_FAILED, hiện là ${order.status}`,
        );
      }

      const items = await this.orderModel.findItemsForStock(orderId, client);
      await this.inventoryService.reserveStock(items, client);

      const reopened = await this.orderModel.reopenForRetry(orderId, client);
      if (!reopened) {
        throw new ConflictException("Trạng thái đơn vừa thay đổi, hãy tải lại");
      }

      return { orderId, status: "PENDING" as const };
    });
  }
}