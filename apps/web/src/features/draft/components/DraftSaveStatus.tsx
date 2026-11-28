import { CloudAlert, CloudCheck, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import type { DraftTextSaveStatus } from "@/features/draft/hooks/useDraftTexts";

type Props = {
  status: DraftTextSaveStatus;
};

const STATUS_TEXT: Record<DraftTextSaveStatus, string> = {
  idle: "자동 저장돼요",
  saving: "저장 중…",
  saved: "자동 저장됨",
  error: "저장 실패",
};

const STATUS_STYLE: Record<DraftTextSaveStatus, string> = {
  idle: "bg-muted text-muted-foreground",
  saving: "bg-muted text-muted-foreground",
  saved: "bg-success-soft text-success-deep",
  error: "bg-destructive/10 text-destructive",
};

// 입력이 자동 저장된다는 걸 보여줘 나갔다 와도 된다는 안심을 준다.
export function DraftSaveStatus({ status }: Props) {
  return (
    <p
      aria-live="polite"
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-2 text-sm font-medium whitespace-nowrap",
        STATUS_STYLE[status],
      )}
    >
      <StatusIcon status={status} />
      {STATUS_TEXT[status]}
    </p>
  );
}

function StatusIcon({ status }: Props) {
  if (status === "saving") {
    return (
      <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
    );
  }
  if (status === "error") {
    return <CloudAlert className="size-3.5" aria-hidden="true" />;
  }
  return <CloudCheck className="size-3.5" aria-hidden="true" />;
}
