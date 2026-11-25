import { PaymentFinalize } from "@/features/payment/components/PaymentFinalize";
import { PaymentFailureView } from "@/features/payment/components/PaymentFailureView";

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

  return (
    <PaymentFinalize
      templateId={templateId}
      orderId={orderId}
      paymentKey={paymentKey}
      amount={Number(amount)}
    />
  );
}
