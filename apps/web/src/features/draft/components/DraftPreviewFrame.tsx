"use client";

import { Loader2 } from "lucide-react";
import type { RefObject } from "react";

import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  containerRef: RefObject<HTMLDivElement | null>;
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
        <Skeleton className="absolute inset-0 h-full w-full rounded-md" />
      )}

      {isBuffering && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <Loader2 className="text-background h-8 w-8 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-muted text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
