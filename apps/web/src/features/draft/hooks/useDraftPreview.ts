"use client";

import { Preview, type ElementState } from "@creatomate/preview";
import { useCallback, useEffect, useRef, useState } from "react";

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

function buildModifications(
  photos: DraftPhoto[],
  texts: DraftSavedText[],
): Record<string, string> {
  const modifications: Record<string, string> = {};
  for (const text of texts) modifications[text.name] = text.text;
  for (const photo of photos) modifications[photo.name] = photo.url;
  return modifications;
}

export function useDraftPreview({
  templateId,
  photos,
  texts,
  autoplay = false,
}: Options) {
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(
    null,
  );
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerNode(node);
  }, []);
  const previewRef = useRef<Preview | null>(null);
  const isReadyRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestRef = useRef({ photos, texts, autoplay });
  latestRef.current = { photos, texts, autoplay };

  // templateId가 바뀌거나 container가 마운트될 때만 Preview를 새로 만든다.
  // photos/texts 변경은 아래 두 번째 effect에서 setModifications만 호출해 반영한다.
  useEffect(() => {
    if (!containerNode) return;

    setIsLoading(true);
    setIsBuffering(false);
    setError(null);
    isReadyRef.current = false;

    const preview = new Preview(
      containerNode,
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
        if (isCancelled) return;

        const current = latestRef.current;
        await preview.setModifications(
          buildModifications(current.photos, current.texts),
        );

        if (isCancelled) return;
        isReadyRef.current = true;
        setIsLoading(false);
        if (current.autoplay) await preview.play();
      } catch {
        if (!isCancelled) {
          setIsLoading(false);
          setError("미리보기를 불러오지 못했습니다.");
        }
      }
    };

    return () => {
      isCancelled = true;
      isReadyRef.current = false;
      previewRef.current = null;
      preview.dispose();
    };
  }, [templateId, containerNode]);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !isReadyRef.current) return;

    let isCancelled = false;

    preview.setModifications(buildModifications(photos, texts)).catch(() => {
      if (!isCancelled) setError("미리보기를 갱신하지 못했습니다.");
    });

    return () => {
      isCancelled = true;
    };
  }, [photos, texts]);

  function seekToElement(name: string) {
    const preview = previewRef.current;
    if (!preview || isLoading) return;

    const element = preview.findElement(
      (candidate) => getElementName(candidate) === name,
    );
    if (element) preview.setTime(element.globalTime + 1);
  }

  return { containerRef, isLoading, isBuffering, error, seekToElement };
}
