"use client";

import { useEffect, useState } from "react";

function getStorageKey(templateId: string): string {
  return `haru:draft:${templateId}`;
}

// 클라이언트가 localStorage에 draftId를 보관해 비회원도 새로고침 후 이어갈 수 있게 한다.
export function useStoredDraftId(templateId: string) {
  const [draftId, setDraftIdState] = useState<string | null | undefined>(
    undefined,
  );

  useEffect(() => {
    setDraftIdState(localStorage.getItem(getStorageKey(templateId)));
  }, [templateId]);

  function setDraftId(id: string) {
    localStorage.setItem(getStorageKey(templateId), id);
    setDraftIdState(id);
  }

  return { draftId, setDraftId };
}
