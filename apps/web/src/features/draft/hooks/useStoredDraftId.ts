"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function getStorageKey(
  templateId: string,
  currentUserId: string | null,
): string {
  return `haru:draft:${templateId}:${currentUserId ?? "guest"}`;
}

export function useStoredDraftId(
  templateId: string,
  currentUserId: string | null | undefined,
) {
  const [draftId, setDraftIdState] = useState<string | null | undefined>(
    undefined,
  );

  const isFreshlyCreated = useRef(false);

  useEffect(() => {
    if (currentUserId === undefined) {
      setDraftIdState(undefined);
      return;
    }
    const raw = localStorage.getItem(getStorageKey(templateId, currentUserId));
    isFreshlyCreated.current = false;
    setDraftIdState(raw);
  }, [templateId, currentUserId]);

  const setDraftId = useCallback(
    (id: string) => {
      if (currentUserId === undefined) return;
      localStorage.setItem(getStorageKey(templateId, currentUserId), id);
      isFreshlyCreated.current = true;
      setDraftIdState(id);
    },
    [templateId, currentUserId],
  );

  const clearDraftId = useCallback(() => {
    if (currentUserId === undefined) return;
    localStorage.removeItem(getStorageKey(templateId, currentUserId));
    setDraftIdState(null);
  }, [templateId, currentUserId]);

  return {
    draftId,
    setDraftId,
    clearDraftId,
    isFreshlyCreated: isFreshlyCreated.current,
  };
}
