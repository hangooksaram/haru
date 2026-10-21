"use client";

import { useQuery } from "@tanstack/react-query";

import { DraftForbiddenError } from "@/features/draft/errors";

import type { Draft } from "@/features/draft/types";

export function useDraft(draftId: string | null) {
  return useQuery({
    queryKey: ["draft", draftId],
    queryFn: async (): Promise<Draft> => {
      const response = await fetch(`/api/drafts/${draftId}`);

      if (response.status === 403) {
        throw new DraftForbiddenError(draftId ?? "");
      }
      if (!response.ok) throw new Error("시안을 불러오지 못했습니다.");

      return response.json();
    },
    enabled: draftId !== null,
  });
}
