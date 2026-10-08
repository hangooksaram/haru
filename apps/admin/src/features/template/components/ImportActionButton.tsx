"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Props = {
  templateId: string;
  mode: "import" | "update";
};

export function ImportActionButton({ templateId, mode }: Props) {
  const [isPending, startTransition] = useTransition();
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const router = useRouter();

  function handleClick() {
    setInlineMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/templates/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: templateId }),
      });

      const data = await response.json();

      if (data.success) {
        const message =
          data.result === "imported" ? "가져오기 완료" : "업데이트 완료";
        setInlineMessage(message);
        toast.success(message);
        router.refresh();
      } else {
        const message = data.message ?? "처리 중 오류가 발생했습니다.";
        setInlineMessage(message);
        toast.error(message);
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {inlineMessage ? (
        <span className="text-muted-foreground text-xs">{inlineMessage}</span>
      ) : null}
      <Button size="sm" onClick={handleClick} disabled={isPending}>
        {isPending ? "처리 중..." : mode === "import" ? "가져오기" : "업데이트"}
      </Button>
    </div>
  );
}
