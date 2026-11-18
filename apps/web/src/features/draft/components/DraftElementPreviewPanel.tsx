"use client";

import type { Ref } from "react";

import { Button } from "@/components/ui/button";
import { DraftPreviewFrame } from "@/features/draft/components/DraftPreviewFrame";
import { cn } from "@/lib/utils";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  containerRef: Ref<HTMLDivElement>;
  isLoading: boolean;
  isBuffering: boolean;
  error: string | null;
};

// 모바일은 기존 UI를 유지하므로 이 패널 자체를 노출하지 않는다.
export function DraftElementPreviewPanel({
  isOpen,
  onToggle,
  containerRef,
  isLoading,
  isBuffering,
  error,
}: Props) {
  return (
    <div className="fixed right-6 bottom-6 z-30 hidden flex-col items-end gap-2 md:flex">
      <div
        aria-hidden={!isOpen}
        className={cn(
          "border-border bg-background w-80 origin-bottom-right rounded-xl border p-1.5 shadow-2xl ring-1 ring-black/5 transition-all duration-200",
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-95 opacity-0",
        )}
      >
        <DraftPreviewFrame
          containerRef={containerRef}
          isLoading={isLoading}
          isBuffering={isBuffering}
          error={error}
        />
      </div>

      <Button
        type="button"
        size="lg"
        variant="secondary"
        onClick={onToggle}
        aria-pressed={isOpen}
        className="mr-3 h-11 rounded-full px-5 text-base shadow-lg"
      >
        {isOpen ? "미리보기 숨기기" : "미리보기 보이기"}
      </Button>
    </div>
  );
}
