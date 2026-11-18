"use client";

import { useState } from "react";

import { useDraftPreview } from "@/features/draft/hooks/useDraftPreview";

import type { DraftPhoto, DraftSavedText } from "@/features/draft/types";

type Options = {
  templateId: string;
  photos: DraftPhoto[];
  texts: DraftSavedText[];
};

export function useDraftElementPreviewPanel({
  templateId,
  photos,
  texts,
}: Options) {
  const [isOpen, setIsOpen] = useState(true);
  const { containerRef, isLoading, isBuffering, error, seekToElement } =
    useDraftPreview({ templateId, photos, texts });

  function onSelect(name: string) {
    setIsOpen(true);
    seekToElement(name);
  }

  return {
    isOpen,
    toggle: () => setIsOpen((prev) => !prev),
    containerRef,
    isLoading,
    isBuffering,
    error,
    onSelect,
  };
}
