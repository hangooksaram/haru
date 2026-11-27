import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import type { DraftTextSaveStatus } from "@/features/draft/hooks/useDraftTexts";

type Props = {
  status: DraftTextSaveStatus;
};

const STATUS_TEXT: Record<Exclude<DraftTextSaveStatus, "idle">, string> = {
  saving: "저장 중…",
  saved: "자동 저장됨",
  error: "저장 실패",
};

// 입력이 자동 저장된다는 걸 보여줘 나갔다 와도 된다는 안심을 준다.
export function DraftSaveStatus({ status }: Props) {
  if (status === "idle") {
    return (
      <p className="text-muted-foreground text-xs">입력하면 자동 저장돼요.</p>
    );
  }

  return (
    <p
      aria-live="polite"
      className={cn(
        "flex items-center gap-1 text-xs",
        status === "error" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {status === "saved" && <Check className="size-3" aria-hidden="true" />}
      {STATUS_TEXT[status]}
    </p>
  );
}
