"use client";

import { useCallback, useEffect, useState } from "react";

function getStorageKey(draftId: string): string {
  return `haru:draft-texts:${draftId}`;
}

// 입력할 때마다 브라우저에 임시 저장해, 같은 시안에 다시 들어오면 값을 그대로 채운다.
// 서버 저장에 성공하면 clear()로 지운다.
export function useStoredDraftTexts(draftId: string | null) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!draftId) {
      setValues({});
      return;
    }

    const raw = localStorage.getItem(getStorageKey(draftId));
    if (!raw) {
      setValues({});
      return;
    }

    try {
      setValues(JSON.parse(raw));
    } catch {
      setValues({});
    }
  }, [draftId]);

  const setValue = useCallback(
    (name: string, value: string) => {
      if (!draftId) return;

      setValues((prev) => {
        const next = { ...prev, [name]: value };
        localStorage.setItem(getStorageKey(draftId), JSON.stringify(next));
        return next;
      });
    },
    [draftId],
  );

  const clear = useCallback(() => {
    if (!draftId) return;
    localStorage.removeItem(getStorageKey(draftId));
    setValues({});
  }, [draftId]);

  return { values, setValue, clear };
}
