"use client";

import { useMutation } from "@tanstack/react-query";

import type { DraftTextInput } from "@/features/draft/types";

type Variables = {
  draftId: string;
  texts: DraftTextInput[];
};

// 시안을 방금 만든 직후에도 저장할 수 있도록 draftId는 호출 시점에 받는다.
export function useUpdateDraftTexts() {
  return useMutation({
    mutationFn: async ({ draftId, texts }: Variables) => {
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
