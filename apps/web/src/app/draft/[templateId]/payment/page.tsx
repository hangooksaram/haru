import { DraftStepNav } from "@/components/DraftStepNav";
import { DraftStepper } from "@/components/DraftStepper";
import { OrderPaymentSummary } from "@/features/order/components/OrderPaymentSummary";
import { PaymentWidget } from "@/features/payment/components/PaymentWidget";

type Props = {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ orderId?: string }>;
};

export default async function DraftPaymentPage({
  params,
  searchParams,
}: Props) {
  const { templateId } = await params;
  const { orderId } = await searchParams;

  return (
    <div className="flex flex-col gap-4 py-4">
      <DraftStepper current={3} templateId={templateId} />
      <DraftStepNav prevHref={`/draft/${templateId}/preview`} />
      {orderId && (
        <>
          <OrderPaymentSummary orderId={orderId} />
          <PaymentWidget orderId={orderId} templateId={templateId} />
        </>
      )}
    </div>
  );
}
