"use client";

import { Loader2 } from "lucide-react";
import type { Ref } from "react";

type Props = {
  containerRef: Ref<HTMLDivElement>;
  isLoading: boolean;
  isBuffering: boolean;
  error: string | null;
};

export function DraftPreviewFrame({
  containerRef,
  isLoading,
  isBuffering,
  error,
}: Props) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md">
      <div ref={containerRef} className="h-full w-full" />

      {isLoading && !error && (
        <div
          role="status"
          className="bg-foreground absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-md"
        >
          <div
            aria-hidden
            className="via-primary/30 absolute inset-0 animate-[draft-preview-shimmer_1.8s_ease-in-out_infinite] bg-linear-to-r from-transparent to-transparent"
          />
          <Loader2 className="text-primary relative h-8 w-8 animate-spin" />
          <p className="text-background relative text-base font-medium">
            미리보기를 준비하고 있어요
          </p>
        </div>
      )}

      {isBuffering && !isLoading && !error && (
        <div
          role="status"
          className="bg-ink/10 absolute inset-0 flex items-center justify-center"
        >
          <Loader2
            aria-hidden="true"
            className="text-background h-8 w-8 animate-spin"
          />
          <span className="sr-only">영상을 불러오고 있어요</span>
        </div>
      )}

      {error && (
        <div className="bg-muted text-muted-foreground absolute inset-0 flex items-center justify-center text-base">
          {error}
        </div>
      )}
    </div>
  );
}
