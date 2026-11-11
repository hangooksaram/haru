"use client";

import { useMutation } from "@tanstack/react-query";

export function useCreateOrderFromDraft() {
  return useMutation({
    mutationFn: async (draftId: string) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId }),
      });
      if (!response.ok) throw new Error("주문 생성에 실패했습니다.");

      return (await response.json()) as { id: string };
    },
  });
}
