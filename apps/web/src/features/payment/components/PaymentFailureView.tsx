import Link from "next/link";

import { Button } from "@/components/ui/button";

type Props = {
  templateId: string;
  orderId?: string;
  message?: string;
};

export function PaymentFailureView({ templateId, orderId, message }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-20 text-center">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        결제에 실패했습니다
      </h1>
      {message && (
        <p className="text-muted-foreground text-sm">{message}</p>
      )}
      <Button asChild size="lg">
        <Link
          href={`/draft/${templateId}/payment${orderId ? `?orderId=${orderId}` : ""}`}
        >
          다시 시도하기
        </Link>
      </Button>
    </div>
  );
}
