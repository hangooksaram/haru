"use client";

import { useCallback, useEffect, useState } from "react";

import { removeLineBreaks } from "@/features/draft/lib/removeLineBreaks";

function getStorageKey(draftId: string): string {
  return `haru:draft-texts:${draftId}`;
}

// 입력할 때마다 브라우저에 임시 저장해, 같은 시안에 다시 들어오면 값을 그대로 채운다.
// 서버 저장(주문 생성 성공 시)에는 clear()로 지운다.
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
      const parsed = JSON.parse(raw) as Record<string, string>;
      // 템플릿의 텍스트 요소가 바뀌었을 수 있으므로 복원한 값도 입력 검증을 거친다.
      setValues(
        Object.fromEntries(
          Object.entries(parsed).map(([key, value]) => [
            key,
            removeLineBreaks(value),
          ]),
        ),
      );
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
