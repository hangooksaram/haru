"use client";

import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCurrentUserId } from "@/features/auth/hooks/useCurrentUserId";
import { useOrder } from "@/features/order/hooks/useOrder";

import type { TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";

type Props = {
  orderId: string;
  templateId: string;
};

export function PaymentWidget({ orderId, templateId }: Props) {
  const userId = useCurrentUserId();
  const { data: order } = useOrder(orderId);
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (userId === undefined || !order) return;

    const price = order.price;
    let isCancelled = false;

    async function initialize() {
      const tossPayments = await loadTossPayments(
        process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY!,
      );
      const widgetsInstance = tossPayments.widgets({
        customerKey: userId ?? ANONYMOUS,
      });

      await widgetsInstance.setAmount({ value: price, currency: "KRW" });
      await widgetsInstance.renderPaymentMethods({
        selector: "#payment-method",
      });
      await widgetsInstance.renderAgreement({ selector: "#agreement" });

      if (!isCancelled) setWidgets(widgetsInstance);
    }

    initialize();

    return () => {
      isCancelled = true;
    };
  }, [userId, order]);

  async function handlePayment() {
    if (!widgets || !order) return;

    setIsRequesting(true);
    try {
      await widgets.requestPayment({
        orderId,
        orderName: order.templateName,
        successUrl: `${window.location.origin}/draft/${templateId}/payment/success`,
        failUrl: `${window.location.origin}/draft/${templateId}/payment/fail`,
      });
    } catch {
      setIsRequesting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div id="payment-method" />
      <div id="agreement" />
      <Button
        size="lg"
        onClick={handlePayment}
        disabled={!widgets || isRequesting}
      >
        결제하기
      </Button>
    </div>
  );
}
