"use client";

import { EyeOff, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DraftPreviewFrame } from "@/features/draft/components/DraftPreviewFrame";
import { removeHyphens } from "@/features/draft/lib/removeHyphens";
import { cn } from "@/lib/utils";

import type { Ref } from "react";

export type DraftPreviewSegment = { name: string; filled: boolean };

const ANIMATION_MS = 380;

type Phase = "visible" | "hiding" | "hidden" | "appearing";

type Props = {
  containerRef: Ref<HTMLDivElement>;
  isLoading: boolean;
  isBuffering: boolean;
  error: string | null;
  activeElementName: string | null;
  segments: DraftPreviewSegment[];
  onReplay: () => void;
  isPlayingAll: boolean;
  onToggleAll: () => void;
  playbackProgress: number;
  onCollapsedChange?: (collapsed: boolean) => void;
};

export function DraftPreviewPanel({
  containerRef,
  isLoading,
  isBuffering,
  error,
  activeElementName,
  segments,
  onReplay,
  isPlayingAll,
  onToggleAll,
  playbackProgress,
  onCollapsedChange,
}: Props) {
  const [phase, setPhase] = useState<Phase>("visible");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIndex = segments.findIndex(
    (segment) => segment.name === activeElementName,
  );
  const activeSegment = activeIndex === -1 ? undefined : segments[activeIndex];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleHide() {
    onCollapsedChange?.(true);
    setPhase("hiding");
    timeoutRef.current = setTimeout(() => {
      setPhase("hidden");
    }, ANIMATION_MS);
  }

  function handleShow() {
    onCollapsedChange?.(false);
    setPhase("appearing");
    timeoutRef.current = setTimeout(() => {
      setPhase("visible");
    }, ANIMATION_MS);
  }

  return (
    <>
      {phase === "hidden" && (
        <button
          type="button"
          onClick={handleShow}
          aria-label="미리보기 다시 열기"
          style={{ transformOrigin: "bottom right" }}
          className="bg-foreground text-background fixed right-8 bottom-8 z-10 flex animate-[draft-preview-pop_320ms_ease-out_both] items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 text-sm font-medium shadow-lg"
        >
          <span className="bg-primary/60 flex h-8 w-14 items-center justify-center rounded-full">
            <Play className="h-3.5 w-3.5 fill-current" />
          </span>
          미리보기
        </button>
      )}

      {/* 숨긴 동안에도 DOM에서 제거하지 않는다. 언마운트하면 미리보기 영상이 다시 로드된다. */}
      <div
        aria-hidden={phase === "hidden"}
        style={{ transformOrigin: "bottom right" }}
        className={cn(
          "flex flex-col gap-3 rounded-2xl border p-4 transition-[transform,opacity] duration-[380ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
          phase === "hiding" &&
            "pointer-events-none translate-y-[55vh] scale-[0.12] opacity-0",
          phase === "appearing" &&
            "animate-[draft-preview-grow_380ms_cubic-bezier(0.2,0,0,1)_both]",
          phase === "hidden" &&
            "pointer-events-none invisible fixed top-0 left-0 opacity-0",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          {activeSegment ? (
            <div className="flex min-w-0 items-center gap-2">
              <Badge variant="secondary" className="shrink-0">
                {activeIndex + 1} / {segments.length}
              </Badge>
              <span className="truncate text-sm font-medium">
                {removeHyphens(activeSegment.name)}
              </span>
            </div>
          ) : (
            <strong className="text-sm">내 영상</strong>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={handleHide}>
            <EyeOff />
            숨기기
          </Button>
        </div>

        <div className="relative">
          <DraftPreviewFrame
            containerRef={containerRef}
            isLoading={isLoading}
            isBuffering={isBuffering}
            error={error}
          />
        </div>
      </div>
    </>
  );
}
