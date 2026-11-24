"use client";

import { DraftPreviewPanel } from "@/features/draft/components/DraftPreviewPanel";
import { useDraftPreviewContext } from "@/features/draft/components/DraftPreviewProvider";
import { cn } from "@/lib/utils";

import type { CSSProperties } from "react";

type Props = {
  children: React.ReactNode;
};

type SectionProps = {
  children: React.ReactNode;
  className?: string;
};

// 스텝 상단 영역(StepBar 등). 그리드 전체 폭을 차지한다.
export function DraftEditorHeader({ children, className }: SectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:col-span-full md:row-start-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

// 스텝 본문 영역. 미리보기 패널 옆(왼쪽 열)에 놓인다.
export function DraftEditorBody({ children, className }: SectionProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col md:col-start-1 md:row-start-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DraftEditorShell({ children }: Props) {
  const {
    containerRef,
    isLoading,
    isBuffering,
    error,
    activeElementName,
    segments,
    replay,
    isPlayingAll,
    toggleAll,
    playbackProgress,
    isCollapsed,
    setIsCollapsed,
  } = useDraftPreviewContext();

  return (
    <div
      className="grid gap-x-6 gap-y-4 py-4 md:[grid-template-columns:var(--preview-cols)] md:transition-[grid-template-columns] md:duration-[380ms] md:ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={
        {
          "--preview-cols": isCollapsed ? "1fr 0fr" : "4.5fr 5.5fr",
        } as CSSProperties
      }
    >
      {children}

      <div className="hidden min-w-0 md:col-start-2 md:row-start-2 md:block">
        <div className="md:sticky md:top-[136px]">
          <DraftPreviewPanel
            containerRef={containerRef}
            isLoading={isLoading}
            isBuffering={isBuffering}
            error={error}
            activeElementName={activeElementName}
            segments={segments}
            onReplay={replay}
            isPlayingAll={isPlayingAll}
            onToggleAll={toggleAll}
            playbackProgress={playbackProgress}
            onCollapsedChange={setIsCollapsed}
          />
        </div>
      </div>
    </div>
  );
}
