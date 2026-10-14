"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function getStorageKey(templateId: string): string {
  return `haru:draft:${templateId}`;
}

// 클라이언트가 localStorage에 draftId를 보관해 비회원도 새로고침 후 이어갈 수 있게 한다.
export function useDraftId(templateId: string) {
  const [draftId, setDraftId] = useState<string | null>(null);

  const { mutate: createDraft, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      if (!response.ok) throw new Error("시안 생성에 실패했습니다.");

      return (await response.json()) as { id: string };
    },
    onSuccess: (draft) => {
      localStorage.setItem(getStorageKey(templateId), draft.id);
      setDraftId(draft.id);
    },
  });

  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey(templateId));

    if (stored) {
      setDraftId(stored);
      return;
    }

    createDraft();
  }, [templateId, createDraft]);

  return { draftId, isCreating: isPending && draftId === null };
}
