"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { isLaterDraftStep } from "@/features/draft/lib/isLaterDraftStep";

import type { Draft, DraftStep } from "@/features/draft/types";

type Variables = {
  draftId: string;
  lastStep: DraftStep;
};

export function useUpdateDraftLastStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ draftId, lastStep }: Variables) => {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastStep }),
      });
      if (!response.ok) throw new Error("마지막 단계를 저장하지 못했습니다.");
    },
    onSuccess: (_data, { draftId, lastStep }) => {
      queryClient.setQueryData<Draft>(["draft", draftId], (draft) =>
        draft && isLaterDraftStep(lastStep, draft.lastStep)
          ? { ...draft, lastStep }
          : draft,
      );
    },
  });
}
