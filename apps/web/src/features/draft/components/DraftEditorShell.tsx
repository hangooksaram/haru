"use client";

import { useSelectedLayoutSegment } from "next/navigation";

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
    isCollapsed,
    setIsCollapsed,
  } = useDraftPreviewContext();

  // 기본정보 스텝은 미리보기를 보여주지 않는다. 다만 사진 단계 진입 시 로딩을 기다리지
  // 않도록 DOM에는 남겨 두고 화면 밖에서 미리 로드한다. (언마운트·이동하면 iframe이 리로드된다)
  const isPreviewHidden = useSelectedLayoutSegment() === "basic-info";

  return (
    <div
      className="grid gap-x-6 gap-y-4 pb-4 md:[grid-template-columns:var(--preview-cols)] md:transition-[grid-template-columns] md:duration-[380ms] md:ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={
        {
          "--preview-cols": isPreviewHidden
            ? "1fr"
            : isCollapsed
              ? "1fr 0fr"
              : "4.5fr 5.5fr",
        } as CSSProperties
      }
    >
      {children}

      <div
        aria-hidden={isPreviewHidden}
        className={cn(
          "hidden min-w-0 md:col-start-2 md:row-start-2 md:block",
          isPreviewHidden &&
            "md:pointer-events-none md:invisible md:fixed md:top-0 md:left-0 md:w-[560px]",
        )}
      >
        <div className="md:sticky md:top-[136px]">
          <DraftPreviewPanel
            containerRef={containerRef}
            isLoading={isLoading}
            isBuffering={isBuffering}
            error={error}
            activeElementName={activeElementName}
            segments={segments}
            onCollapsedChange={setIsCollapsed}
            isHidden={isPreviewHidden}
          />
        </div>
      </div>
    </div>
  );
}
