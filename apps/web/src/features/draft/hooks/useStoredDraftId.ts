"use client";

import { useCallback, useEffect, useState } from "react";

function getStorageKey(
  templateId: string,
  currentUserId: string | null,
): string {
  return `haru:draft:${templateId}:${currentUserId ?? "guest"}`;
}

// 클라이언트가 localStorage에 draftId를 보관해 비회원도 새로고침 후 이어갈 수 있게 한다.
// 키에 로그인 사용자(또는 guest)를 포함해, 로그인/로그아웃을 오가도 서로 다른 슬롯에 보관되어 덮어쓰지 않는다.
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
    const raw = localStorage.getItem(
      getStorageKey(templateId, currentUserId),
    );
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
