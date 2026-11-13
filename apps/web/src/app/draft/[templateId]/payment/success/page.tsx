import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  OrderForbiddenError,
  OrderNotFoundError,
} from "@/features/order/errors";
import { ClearDraftIdOnPaymentSuccess } from "@/features/payment/components/ClearDraftIdOnPaymentSuccess";
import { PaymentFailureView } from "@/features/payment/components/PaymentFailureView";
import {
  PaymentAmountMismatchError,
  TossPaymentConfirmError,
} from "@/features/payment/errors";
import { confirmPayment } from "@/features/payment/service/confirm-payment";
import { createServerClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{
    orderId?: string;
    paymentKey?: string;
    amount?: string;
  }>;
};

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: Props) {
  const { templateId } = await params;
  const { orderId, paymentKey, amount } = await searchParams;

  if (!orderId || !paymentKey || !amount) {
    return (
      <PaymentFailureView
        templateId={templateId}
        message="결제 정보가 올바르지 않습니다."
      />
    );
  }

  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  try {
    await confirmPayment({
      orderId,
      paymentKey,
      amount: Number(amount),
      currentUserId: data.user?.id ?? null,
    });
  } catch (error) {
    if (
      error instanceof OrderNotFoundError ||
      error instanceof OrderForbiddenError ||
      error instanceof PaymentAmountMismatchError
    ) {
      return (
        <PaymentFailureView
          templateId={templateId}
          orderId={orderId}
          message="결제를 확인할 수 없습니다."
        />
      );
    }

    if (error instanceof TossPaymentConfirmError) {
      return (
        <PaymentFailureView
          templateId={templateId}
          orderId={orderId}
          message={error.message}
        />
      );
    }

    throw error;
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
