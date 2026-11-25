"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { useFinalizePayment } from "@/features/payment/hooks/useFinalizePayment";

import { ClearDraftIdOnPaymentSuccess } from "./ClearDraftIdOnPaymentSuccess";
import { PaymentFailureView } from "./PaymentFailureView";

type Props = {
  templateId: string;
  orderId: string;
  paymentKey: string;
  amount: number;
};

export function PaymentFinalize({
  templateId,
  orderId,
  paymentKey,
  amount,
}: Props) {
  const { mutate, isSuccess, isError, error } = useFinalizePayment();
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    // Strict Mode에서 effect가 두 번 돌아도 승인 요청은 한 번만 보낸다.
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    mutate({ orderId, paymentKey, amount });
  }, [mutate, orderId, paymentKey, amount]);

  if (isError) {
    return (
      <PaymentFailureView
        templateId={templateId}
        orderId={orderId}
        message={error.message}
      />
    );
  }

  if (!isSuccess) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <p className="text-muted-foreground text-sm">
          결제를 확인하고 있습니다...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-20 text-center">
      <ClearDraftIdOnPaymentSuccess />
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        결제가 완료되었습니다
      </h1>
      <Button asChild size="lg">
        <Link href="/">홈으로</Link>
      </Button>
    </div>
  );
}
