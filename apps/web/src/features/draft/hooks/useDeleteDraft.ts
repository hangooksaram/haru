"use client";

import { useMutation } from "@tanstack/react-query";

import { DraftForbiddenError } from "@/features/draft/errors";

export function useDeleteDraft() {
  return useMutation({
    mutationFn: async (draftId: string): Promise<void> => {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: "DELETE",
      });

      if (response.status === 403) {
        throw new DraftForbiddenError(draftId);
      }
      if (!response.ok && response.status !== 404) {
        throw new Error("시안을 삭제하지 못했습니다.");
      }
    },
  });
}
