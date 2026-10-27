"use client";

import { createContext, useCallback, useContext, useState } from "react";

type DraftAcknowledgedContextValue = {
  isAcknowledged: (draftId: string) => boolean;
  acknowledge: (draftId: string) => void;
};

const DraftAcknowledgedContext =
  createContext<DraftAcknowledgedContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

// /templates처럼 /draft/[templateId] 바깥 경로를 거쳐 돌아와도 상태가 유지되도록
// 루트(Providers)에 둔다. 새로고침·새 탭에서는 초기화되어 이어하기 모달이 다시 뜬다.
export function DraftAcknowledgedProvider({ children }: Props) {
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(
    () => new Set(),
  );

  const isAcknowledged = useCallback(
    (draftId: string) => acknowledgedIds.has(draftId),
    [acknowledgedIds],
  );

  const acknowledge = useCallback((draftId: string) => {
    setAcknowledgedIds((prev) => {
      if (prev.has(draftId)) return prev;

      return new Set(prev).add(draftId);
    });
  }, []);

  return (
    <DraftAcknowledgedContext.Provider value={{ isAcknowledged, acknowledge }}>
      {children}
    </DraftAcknowledgedContext.Provider>
  );
}

export function useDraftAcknowledged() {
  const context = useContext(DraftAcknowledgedContext);

  if (!context) {
    throw new Error(
      "useDraftAcknowledged는 DraftAcknowledgedProvider 안에서만 사용할 수 있습니다.",
    );
  }

  return context;
}
