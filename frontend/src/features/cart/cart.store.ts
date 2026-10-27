// TV2 — State giỏ khách, lưu localStorage có kiểm tra dữ liệu; chưa triển khai.
export interface CartItem {
  productId: string;
  size: string;
  toppingIds: string[];
  quantity: number;
  note: string; // bố sung bởi tv1: yêu cầu thêm ghi chú cho món , dùng chữ nhạt 
}
export class CartStore {
  // TODO TV2: gộp key theo productId + size + toppingIds đã sắp xếp; quantity nguyên 1–99.
  addItem(item: CartItem): never {
    throw new Error("TODO TV2: addItem");
  }
  updateQuantity(itemKey: string, quantity: number): never {
    throw new Error("TODO TV2: updateQuantity");
  }
  removeItem(itemKey: string): never {
    throw new Error("TODO TV2: removeItem");
  }
  // TODO TV2: tổng hiển thị từ giá sản phẩm; tổng chính thức do TV4 tính.
  calculateSubtotal(): never {
    throw new Error("TODO TV2: calculateSubtotal");
  }
  restoreCart(): never {
    throw new Error("TODO TV2: restoreCart");
  }
  // TODO TV2: chỉ gọi sau API xác nhận PAID, không xóa khi lỗi/timeout.
  clearAfterPayment(): never {
    throw new Error("TODO TV2: clearAfterPayment");
  }
}
