import { PaymentStep } from "@/features/payment/components/PaymentStep";

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

  if (!orderId) return null;

  return <PaymentStep templateId={templateId} orderId={orderId} />;
}
