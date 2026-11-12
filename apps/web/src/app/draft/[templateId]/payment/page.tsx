import { DraftStepNav } from "@/components/DraftStepNav";
import { DraftStepper } from "@/components/DraftStepper";
import { OrderPaymentSummary } from "@/features/order/components/OrderPaymentSummary";

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
    <div className="flex flex-col gap-10 py-10">
      <DraftStepper current={4} />
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        결제
      </h1>
      {orderId && <OrderPaymentSummary orderId={orderId} />}
      <DraftStepNav prevHref={`/draft/${templateId}/preview`} />
    </div>
  );
}
