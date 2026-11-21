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

// 한 번에 정확히 하나의 요소만 바뀌었을 때만 그 요소의 구간을 재생한다.
// (초기 복원처럼 여러 요소가 동시에 바뀌는 경우는 정책에 정의되어 있지 않다)
function findSingleChangedKey(
  prev: Record<string, string>,
  next: Record<string, string>,
): string | null {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  let changedKey: string | null = null;
  let changedCount = 0;

  for (const key of keys) {
    if (prev[key] !== next[key]) {
      changedKey = key;
      changedCount += 1;
    }
  }

  return changedCount === 1 ? changedKey : null;
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
  const prevModificationsRef = useRef<Record<string, string>>({});
  const durationRef = useRef(0);
  // 재생 구간 제한(playElementSegment)이 끝나야 할 시점. null이면 제한 없음.
  const segmentEndTimeRef = useRef<number | null>(null);
  const isPlayingAllRef = useRef(false);
  const activeElementNameRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeElementName, setActiveElementNameState] = useState<
    string | null
  >(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  const latestRef = useRef({ photos, texts, autoplay });
  latestRef.current = { photos, texts, autoplay };

  function setActiveElementName(name: string | null) {
    activeElementNameRef.current = name;
    setActiveElementNameState(name);
  }

  // templateId가 바뀌거나 container가 마운트될 때만 Preview를 새로 만든다.
  // photos/texts 변경은 아래 두 번째 effect에서 setModifications만 호출해 반영한다.
  useEffect(() => {
    if (!containerNode) return;

    setIsLoading(true);
    setIsBuffering(false);
    setError(null);
    isReadyRef.current = false;
    segmentEndTimeRef.current = null;

    const preview = new Preview(
      containerNode,
      "player",
      process.env.NEXT_PUBLIC_CREATOMATE_PUBLIC_TOKEN!,
    );
    previewRef.current = preview;

    let isCancelled = false;

    preview.onLoad = () => setIsBuffering(true);
    preview.onLoadComplete = () => setIsBuffering(false);
    preview.onPlay = () => {
      isPlayingAllRef.current = true;
      setIsPlayingAll(true);
    };
    preview.onPause = () => {
      isPlayingAllRef.current = false;
      setIsPlayingAll(false);
    };

    // 재생 위치 진행률을 추적하고, 구간 재생 제한과 전체 재생 중 현재 요소 추적을 함께 처리한다.
    preview.onTimeChange = (time) => {
      setPlaybackProgress(
        durationRef.current > 0 ? time / durationRef.current : 0,
      );

      const endTime = segmentEndTimeRef.current;
      if (endTime !== null && time >= endTime) {
        segmentEndTimeRef.current = null;
        preview.pause();
      }

      if (isPlayingAllRef.current) {
        const current = preview.getElements().find((element) => {
          const name = getElementName(element);
          return (
            name !== undefined &&
            time >= element.globalTime &&
            time < element.globalTime + element.duration
          );
        });
        const name = current ? getElementName(current) : undefined;
        if (name && name !== activeElementNameRef.current) {
          setActiveElementName(name);
        }
      }
    };

    preview.onReady = async () => {
      try {
        await preview.loadTemplate(templateId);
        if (isCancelled) return;

        const current = latestRef.current;
        const initialModifications = buildModifications(
          current.photos,
          current.texts,
        );
        await preview.setModifications(initialModifications);
        prevModificationsRef.current = initialModifications;
        durationRef.current = preview.state?.duration ?? 0;

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
      preview.onTimeChange = undefined;
      preview.dispose();
    };
  }, [templateId, containerNode]);

  // 요소명의 시작 프레임으로 이동해 멈춘다. 재생하지 않는다.
  function seekToElementStart(name: string) {
    const preview = previewRef.current;
    if (!preview) return;

    const element = preview.findElement(
      (candidate) => getElementName(candidate) === name,
    );
    if (!element) return;

    segmentEndTimeRef.current = null;
    preview.pause();
    preview.setTime(element.globalTime + 1);
  }

  // 요소명의 구간(globalTime ~ globalTime + duration)만 재생하고 끝나면 멈춘다.
  function playElementSegment(name: string) {
    const preview = previewRef.current;
    if (!preview) return;

    const element = preview.findElement(
      (candidate) => getElementName(candidate) === name,
    );
    if (!element) return;

    segmentEndTimeRef.current = element.globalTime + element.duration;
    preview.setTime(element.globalTime + 1);
    preview.play();
  }

  // 채워도 자동 재생하지 않는다. 반영 후 해당 요소의 프레임에서 멈춘 채로 둔다.
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !isReadyRef.current) return;

    let isCancelled = false;
    const nextModifications = buildModifications(photos, texts);
    const changedName = findSingleChangedKey(
      prevModificationsRef.current,
      nextModifications,
    );
    prevModificationsRef.current = nextModifications;

    preview
      .setModifications(nextModifications)
      .then(() => {
        if (isCancelled || !changedName) return;
        setActiveElementName(changedName);
        seekToElementStart(changedName);
      })
      .catch(() => {
        if (!isCancelled) setError("미리보기를 갱신하지 못했습니다.");
      });

    return () => {
      isCancelled = true;
    };
  }, [photos, texts]);

  // 요소를 선택하면 해당 위치에서 멈춘다. 재생하지 않는다.
  function selectElement(name: string) {
    if (isLoading) return;
    seekToElementStart(name);
    setActiveElementName(name);
  }

  function replay() {
    if (activeElementName) playElementSegment(activeElementName);
  }

  // 영상 전체를 재생/일시정지한다.
  function toggleAll() {
    const preview = previewRef.current;
    if (!preview) return;

    if (isPlayingAll) {
      preview.pause();
    } else {
      segmentEndTimeRef.current = null;
      preview.play();
    }
  }

  return {
    containerRef,
    isLoading,
    isBuffering,
    error,
    activeElementName,
    selectElement,
    replay,
    isPlayingAll,
    toggleAll,
    playbackProgress,
  };
}
