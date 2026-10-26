"use client";

import { createContext, useContext } from "react";

import { useCurrentUserId } from "@/features/auth/hooks/useCurrentUserId";
import { useStoredDraftId } from "@/features/draft/hooks/useStoredDraftId";

type DraftIdContextValue = {
  draftId: string | null | undefined;
  setDraftId: (id: string) => void;
  clearDraftId: () => void;
  isFreshlyCreated: boolean;
};

const DraftIdContext = createContext<DraftIdContextValue | null>(null);

type Props = {
  templateId: string;
  children: React.ReactNode;
};

export function DraftIdProvider({ templateId, children }: Props) {
  const currentUserId = useCurrentUserId();
  const value = useStoredDraftId(templateId, currentUserId);

  return (
    <DraftIdContext.Provider value={value}>{children}</DraftIdContext.Provider>
  );
}

export function useDraftId() {
  const context = useContext(DraftIdContext);

  if (!context) {
    throw new Error(
      "useDraftId는 DraftIdProvider 안에서만 사용할 수 있습니다.",
    );
  }

  return context;
}
