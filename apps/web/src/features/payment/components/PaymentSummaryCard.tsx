import { Info } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export type PaymentSummaryItem = {
  label: string;
  value: string;
  href: string;
  actionLabel: string;
};

type Props = {
  templateName: string;
  price: number | null | undefined;
  items: PaymentSummaryItem[];
  payLabel: string;
  onPayClick: () => void;
  isPayDisabled: boolean;
  showLoginNotice: boolean;
  message: string | null;
  validationErrors: string[] | null;
  isValidationError: boolean;
};

export function PaymentSummaryCard({
  templateName,
  price,
  items,
  payLabel,
  onPayClick,
  isPayDisabled,
  showLoginNotice,
  message,
  validationErrors,
  isValidationError,
}: Props) {
  return (
    <aside
      aria-label="주문 요약"
      className="flex min-w-0 flex-col gap-5 rounded-2xl border p-5 md:sticky md:top-[136px]"
    >
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs font-bold">주문 확인</p>
        <h2 className="text-lg font-extrabold text-balance">{templateName}</h2>
      </div>

      <ul className="flex flex-col border-t">
        {items.map((item) => (
          <li
            key={item.label}
            className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3 border-b py-3"
          >
            <span className="text-[13px] font-semibold">{item.label}</span>
            <span
              title={item.value}
              className="text-muted-foreground truncate text-[13px]"
            >
              {item.value}
            </span>
            <Link
              href={item.href}
              aria-label={`${item.label} ${item.actionLabel}`}
              className="text-brand-deep hover:bg-brand-soft rounded-md px-2 py-1 text-xs font-semibold"
            >
              {item.actionLabel}
            </Link>
          </li>
        ))}
      </ul>

      {validationErrors && (
        <div className="bg-destructive/10 text-destructive flex flex-col gap-1.5 rounded-lg px-3 py-2.5 text-xs">
          <p className="font-semibold">
            고쳐야 할 내용이 있어요. 위 항목에서 수정한 뒤 결제할 수 있어요.
          </p>
          <ul className="list-disc pl-4">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {isValidationError && (
        <p className="text-destructive text-xs">
          영상 요청 내용을 확인하지 못했습니다.
        </p>
      )}

      {price != null && (
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-semibold">결제 금액</span>
          <span className="text-2xl font-extrabold tabular-nums">
            {price.toLocaleString("ko-KR")}원
          </span>
        </div>
      )}

      {showLoginNotice && (
        <p className="bg-brand-soft flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs">
          <Info className="text-brand-deep mt-0.5 size-3.5 shrink-0" />
          결제하려면 간편 로그인이 필요해요. 작성한 내용은 그대로 유지돼요.
        </p>
      )}

      {message && (
        <p className="text-sm font-medium text-amber-600">{message}</p>
      )}

      <div className="flex flex-col gap-2">
        <Button
          className="h-[52px] w-full rounded-xl text-[15px] font-extrabold"
          onClick={onPayClick}
          disabled={isPayDisabled}
        >
          {payLabel}
        </Button>
        <p className="text-muted-foreground text-center text-[11px]">
          결제 후 주문이 확정돼요
        </p>
      </div>
    </aside>
  );
}
