import { PaymentFailureView } from "@/features/payment/components/PaymentFailureView";

type Props = {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ orderId?: string; message?: string }>;
};

export default async function PaymentFailPage({ params, searchParams }: Props) {
  const { templateId } = await params;
  const { orderId, message } = await searchParams;

  return (
    <PaymentFailureView templateId={templateId} orderId={orderId} message={message} />
  );
}
