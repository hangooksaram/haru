"use client";

import { useEffect, useRef } from "react";

import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { useCreateDraft } from "@/features/draft/hooks/useCreateDraft";

// 시안이 없는 채로 화면에 들어오면 시안을 한 번 만든다. (기본정보 화면만 사용)
export function useCreateDraftOnEntry(templateId: string) {
  const { draftId, setDraftId } = useDraftId();
  const { mutate: createDraft } = useCreateDraft();
  const hasRequestedDraft = useRef(false);

  useEffect(() => {
    if (draftId) {
      // 시안이 사라지면(새로 시작) 다시 만들 수 있게 한다.
      hasRequestedDraft.current = false;
      return;
    }
    if (draftId === undefined || hasRequestedDraft.current) return;

    hasRequestedDraft.current = true;
    createDraft(templateId, {
      onSuccess: ({ id }) => setDraftId(id),
      onError: () => {
        hasRequestedDraft.current = false;
      },
    });
  }, [draftId, templateId, createDraft, setDraftId]);
}
