import { PaymentStep } from "@/features/payment/components/PaymentStep";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function DraftPaymentPage({ params }: Props) {
  const { templateId } = await params;

  return <PaymentStep templateId={templateId} />;
}
