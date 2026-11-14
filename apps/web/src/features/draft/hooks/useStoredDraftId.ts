"use client";

import { useCallback, useEffect, useState } from "react";

function getStorageKey(
  templateId: string,
  currentUserId: string | null,
): string {
  return `haru:draft:${templateId}:${currentUserId ?? "guest"}`;
}

// 훅 바깥(예: 내 영상 목록)에서도 같은 저장 형식으로 draftId를 읽고 쓰기 위한 함수.
export function readStoredDraftId(
  templateId: string,
  currentUserId: string | null,
): string | null {
  return localStorage.getItem(getStorageKey(templateId, currentUserId));
}

export function writeStoredDraftId(
  templateId: string,
  currentUserId: string | null,
  draftId: string,
): void {
  localStorage.setItem(getStorageKey(templateId, currentUserId), draftId);
}

export function findMigratableDraftId(
  templateId: string,
  ownKey: string,
): { key: string; draftId: string } | null {
  const prefix = `haru:draft:${templateId}:`;
  let found: { key: string; draftId: string } | null = null;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || key === ownKey || !key.startsWith(prefix)) continue;

    const draftId = localStorage.getItem(key);
    if (!draftId) continue;

    if (found) return null;
    found = { key, draftId };
  }

  return found;
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

    const ownKey = getStorageKey(templateId, currentUserId);
    const raw = localStorage.getItem(ownKey);

    if (raw) {
      setDraftIdState(raw);
      return;
    }

    const migratable = findMigratableDraftId(templateId, ownKey);
    if (migratable) {
      localStorage.setItem(ownKey, migratable.draftId);
      localStorage.removeItem(migratable.key);
      setDraftIdState(migratable.draftId);
      return;
    }

    setDraftIdState(null);
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
