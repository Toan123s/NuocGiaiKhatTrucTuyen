"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import type { OrderDetail } from "@/types/customer-order";
import { fetchOrderDetail, retryOrderPayment } from "@/lib/client-api";
import { authorizedRequest } from "@/features/auth/auth.service";
import { formatVnd, shortOrderId } from "@/features/orders/order-format";
import { ErrorBlock, LoadingBlock } from "@/components/orders/OrderBlocks";
import "./payment.css";

function getIdempotencyKey(orderId: string): string {
  const storageKey = `payment_idempotency_key:${orderId}`;
  let key = sessionStorage.getItem(storageKey);
  if (!key) {
    key = uuidv4();
    sessionStorage.setItem(storageKey, key);
  }
  return key;
}

function clearIdempotencyKey(orderId: string): void {
  sessionStorage.removeItem(`payment_idempotency_key:${orderId}`);
}

export function PaymentView() {
  return (
    <Suspense fallback={<LoadingBlock text="Đang tải thông tin thanh toán" />}>
      <PaymentContent />
    </Suspense>
  );
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"WALLET" | "CARD">("WALLET");
  const qrBankId = process.env.NEXT_PUBLIC_VIETQR_BANK_ID ?? "970426";
  const qrAccountNo =
    process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO ?? "SBSEPAY354HYTS9068D";
  const qrAccountName =
    process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME ?? "BREWLITE";
  const transferDescription = order
    ? `BREWLITE-ORDER-${order.id}`
    : "";
  const qrUrl = order
    ? `https://img.vietqr.io/image/${qrBankId}-${qrAccountNo}-compact2.png?amount=${order.total}&addInfo=${encodeURIComponent(transferDescription)}&accountName=${encodeURIComponent(qrAccountName)}`
    : null;

  useEffect(() => {
    if (!orderId) {
      setError("Không tìm thấy mã đơn hàng");
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      try {
        const orderData = await fetchOrderDetail(orderId, new AbortController().signal);
        setOrder(orderData);
        // Nếu đơn hàng đã được thanh toán, xóa idempotency key cũ và chuyển hướng
        if (orderData.status === "PAID" || orderData.status === "COMPLETED") {
          clearIdempotencyKey(orderData.id);
          router.push(`/payment-status?orderId=${orderId}`);
        }
      } catch (err: any) {
        setError(err.message || "Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, router]);

  const handlePayment = async () => {
    if (!orderId || !order || isProcessing) return;

    setIsProcessing(true);
    setError("");

    try {
      if (order.status === "PAYMENT_FAILED") {
        await retryOrderPayment(order.id);
        clearIdempotencyKey(order.id);
        setOrder({ ...order, status: "PENDING" });
      }
      const key = getIdempotencyKey(order.id);
      const payment = await authorizedRequest<{
        status: "PROCESSING" | "SUCCEEDED" | "FAILED";
      }>(`/payments`, {
        method: 'POST',
        headers: {
          'Idempotency-Key': key
        },
        body: {
          orderId: order.id,
          amount: order.total,
          method: selectedMethod
        }
      });

      if (payment.status !== "PROCESSING") {
        clearIdempotencyKey(order.id);
      }

      // TV6 yêu cầu chuyển hướng sang trang báo cáo kết quả
      router.push(`/payment-status?orderId=${orderId}`);

    } catch (err: any) {
      setError(err.message || "Giao dịch thanh toán bị từ chối hoặc có lỗi xảy ra. Hãy thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <section className="container ord-page">
        <LoadingBlock text="Đang tải thông tin đơn hàng" />
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="container ord-page">
        <ErrorBlock title="Lỗi thanh toán" message={error || "Đơn hàng không hợp lệ"} />
        <Link href="/" className="outline-button">Quay về trang chủ</Link>
      </section>
    );
  }

  return (
    <section className="container ord-page">
      <h1>Thanh toán không tiền mặt</h1>
      <p className="ord-sub">
        Đơn #{shortOrderId(order.id)} · {formatVnd(order.total)}
      </p>

      <div className="pay-panel">
        <h2>Chọn phương thức thanh toán</h2>

        <div className="payment-methods" style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="paymentMethod"
              value="WALLET"
              checked={selectedMethod === "WALLET"}
              onChange={() => setSelectedMethod("WALLET")}
              disabled={isProcessing}
            />
            Ví điện tử
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="paymentMethod"
              value="CARD"
              checked={selectedMethod === "CARD"}
              onChange={() => setSelectedMethod("CARD")}
              disabled={isProcessing}
            />
            Thẻ ngân hàng
          </label>
        </div>

        {error && <p className="pay-note" style={{ color: 'red' }} role="alert">{error}</p>}

        {qrUrl && (
          <div className="pay-qr">
            <h3>Quét mã QR để chuyển khoản</h3>
            <img className="pay-qr-image" src={qrUrl} alt="Mã QR chuyển khoản VietQR" />
            <p>
              Nội dung chuyển khoản: <strong>{transferDescription}</strong>
            </p>
          </div>
        )}
      </div>

      <div className="ord-actions">
        <button
          type="button"
          className="primary-button"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? "Đang xử lý giao dịch..." : `Thanh toán ${formatVnd(order.total)}`}
        </button>
        <Link className="outline-button" href={`/orders/${order.id}`}>
          Xem lại đơn hàng
        </Link>
      </div>
    </section>
  );
}