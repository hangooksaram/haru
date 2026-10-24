"use client";

import { useMutation } from "@tanstack/react-query";

import type { DraftTextInput } from "@/features/draft/types";

export function useUpdateDraftTexts(draftId: string) {
  return useMutation({
    mutationFn: async (texts: DraftTextInput[]) => {
      const response = await fetch(`/api/drafts/${draftId}/texts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts }),
      });
      if (!response.ok) {
        throw new Error("텍스트 저장에 실패했습니다.");
      }
    },
  });
}
