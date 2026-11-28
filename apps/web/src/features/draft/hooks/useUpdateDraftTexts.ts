"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { isLaterDraftStep } from "@/features/draft/lib/isLaterDraftStep";

import type { Draft, DraftStep, DraftTextInput } from "@/features/draft/types";

type Variables = {
  draftId: string;
  texts: DraftTextInput[];
  // 다음 버튼으로 넘어갈 단계. 자동 저장에는 보내지 않는다.
  lastStep?: DraftStep;
};

// 시안을 방금 만든 직후에도 저장할 수 있도록 draftId는 호출 시점에 받는다.
export function useUpdateDraftTexts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ draftId, texts, lastStep }: Variables) => {
      const response = await fetch(`/api/drafts/${draftId}/texts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts, lastStep }),
      });
      if (!response.ok) {
        throw new Error("텍스트 저장에 실패했습니다.");
      }
    },
    onSuccess: (_data, { draftId, lastStep }) => {
      if (!lastStep) return;
      queryClient.setQueryData<Draft>(["draft", draftId], (draft) =>
        draft && isLaterDraftStep(lastStep, draft.lastStep)
          ? { ...draft, lastStep }
          : draft,
      );
    },
  });
}
