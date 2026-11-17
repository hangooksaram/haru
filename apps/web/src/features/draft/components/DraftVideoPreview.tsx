"use client";

import { DraftPreviewFrame } from "@/features/draft/components/DraftPreviewFrame";
import { useDraftPreview } from "@/features/draft/hooks/useDraftPreview";

import type { DraftPhoto, DraftSavedText } from "@/features/draft/types";

type Props = {
  templateId: string;
  photos: DraftPhoto[];
  texts: DraftSavedText[];
};

export function DraftVideoPreview({ templateId, photos, texts }: Props) {
  const { containerRef, isLoading, isBuffering, error } = useDraftPreview({
    templateId,
    photos,
    texts,
    autoplay: true,
  });

  return (
    <DraftPreviewFrame
      containerRef={containerRef}
      isLoading={isLoading}
      isBuffering={isBuffering}
      error={error}
    />
  );
}
