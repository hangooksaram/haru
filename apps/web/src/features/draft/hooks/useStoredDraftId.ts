"use client";

import { useCallback, useEffect, useState } from "react";

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

  useEffect(() => {
    if (currentUserId === undefined) {
      setDraftIdState(undefined);
      return;
    }
    const raw = localStorage.getItem(getStorageKey(templateId, currentUserId));
    setDraftIdState(raw);
  }, [templateId, currentUserId]);

  const setDraftId = useCallback(
    (id: string) => {
      if (currentUserId === undefined) return;
      localStorage.setItem(getStorageKey(templateId, currentUserId), id);
      setDraftIdState(id);
    },
    [templateId, currentUserId],
  );

  const clearDraftId = useCallback(() => {
    if (currentUserId === undefined) return;
    localStorage.removeItem(getStorageKey(templateId, currentUserId));
    setDraftIdState(null);
  }, [templateId, currentUserId]);

  return { draftId, setDraftId, clearDraftId };
}
