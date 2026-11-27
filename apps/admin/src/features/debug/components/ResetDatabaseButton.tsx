"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ResetDatabaseButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      "시안·주문·결제 데이터를 모두 삭제합니다. (템플릿·사용자는 유지)\n계속할까요?",
    );
    if (!confirmed) return;

    startTransition(async () => {
      const response = await fetch("/api/debug/reset-db", { method: "POST" });
      const data = await response.json();

      if (data.success) {
        toast.success("시안·주문 데이터를 모두 삭제했습니다.");
      } else {
        toast.error(data.message ?? "처리 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "삭제 중..." : "DB 데이터 비우기 (디버깅)"}
    </Button>
  );
}
