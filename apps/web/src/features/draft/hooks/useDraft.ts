"use client";

import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { DraftForbiddenError, DraftNotFoundError } from "@/features/draft/errors";

import type { Draft } from "@/features/draft/types";

export function useDraft(draftId: string | null) {
  const { clearDraftId } = useDraftId();

  const query = useQuery({
    queryKey: ["draft", draftId],
    queryFn: async (): Promise<Draft> => {
      const response = await fetch(`/api/drafts/${draftId}`);

      if (response.status === 403) {
        throw new DraftForbiddenError(draftId ?? "");
      }
      if (response.status === 404) {
        throw new DraftNotFoundError(draftId ?? "");
      }
      if (!response.ok) throw new Error("시안을 불러오지 못했습니다.");

      return response.json();
    },
    enabled: draftId !== null,
  });

  // 저장된 draftId가 더 이상 유효하지 않으면(소유자가 아니거나 삭제됨) 지워서
  // 다음 조회에서 새 시안이 생성되도록 한다.
  useEffect(() => {
    if (
      query.error instanceof DraftForbiddenError ||
      query.error instanceof DraftNotFoundError
    ) {
      clearDraftId();
    }
  }, [query.error, clearDraftId]);

  return query;
}
