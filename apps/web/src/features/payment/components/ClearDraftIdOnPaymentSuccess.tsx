"use client";

import { useEffect } from "react";

import { useDraftId } from "@/features/draft/components/DraftIdProvider";

export function ClearDraftIdOnPaymentSuccess() {
  const { clearDraftId } = useDraftId();

  useEffect(() => {
    clearDraftId();
  }, [clearDraftId]);

  return null;
}
