"use client";

import { Preview, type ElementState } from "@creatomate/preview";
import { useEffect, useRef, useState } from "react";

import type { DraftPhoto, DraftSavedText } from "@/features/draft/types";

type Options = {
  templateId: string;
  photos: DraftPhoto[];
  texts: DraftSavedText[];
  autoplay?: boolean;
};

function getElementName(element: ElementState): string | undefined {
  const name = element.source.name;
  return typeof name === "string" ? name : undefined;
}

export function useDraftPreview({
  templateId,
  photos,
  texts,
  autoplay = false,
}: Options) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<Preview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setIsLoading(true);
    setIsBuffering(false);
    setError(null);

    const preview = new Preview(
      container,
      "player",
      process.env.NEXT_PUBLIC_CREATOMATE_PUBLIC_TOKEN!,
    );
    previewRef.current = preview;

    let isCancelled = false;

    preview.onLoad = () => setIsBuffering(true);
    preview.onLoadComplete = () => setIsBuffering(false);

    preview.onReady = async () => {
      try {
        await preview.loadTemplate(templateId);

        const modifications: Record<string, string> = {};
        for (const text of texts) modifications[text.name] = text.text;
        for (const photo of photos) modifications[photo.name] = photo.url;

        await preview.setModifications(modifications);

        if (isCancelled) return;
        setIsLoading(false);
        if (autoplay) await preview.play();
      } catch {
        if (!isCancelled) {
          setIsLoading(false);
          setError("미리보기를 불러오지 못했습니다.");
        }
      }
    };

    return () => {
      isCancelled = true;
      previewRef.current = null;
      preview.dispose();
    };
  }, [templateId, photos, texts, autoplay]);

  function seekToElement(name: string) {
    const preview = previewRef.current;
    if (!preview || isLoading) return;

    const element = preview.findElement(
      (candidate) => getElementName(candidate) === name,
    );
    if (element) preview.setTime(element.globalTime);
  }

  return { containerRef, isLoading, isBuffering, error, seekToElement };
}
