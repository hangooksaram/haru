"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

import type { TemplateDetail } from "@/features/template/types";

type Props = {
  template: TemplateDetail;
  videoSrc: string;
  isCurrent: boolean;
  onSelect: (template: TemplateDetail) => void;
};

const PREVIEW_PLAYBACK_RATE = 8;

// 템플릿 변경 목록의 카드. 마우스를 올리거나 포커스하면 미리보기 영상을 재생한다.
export function TemplateSwitchCard({
  template,
  videoSrc,
  isCurrent,
  onSelect,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  function handlePreviewStart() {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = PREVIEW_PLAYBACK_RATE;
    playPromiseRef.current = video.play().catch(() => {});
  }

  function handlePreviewEnd() {
    const video = videoRef.current;
    if (!video) return;
    Promise.resolve(playPromiseRef.current).then(() => {
      video.pause();
      video.currentTime = 0;
    });
  }

  return (
    <button
      type="button"
      aria-current={isCurrent ? "true" : undefined}
      className="flex cursor-pointer flex-col gap-2 text-left"
      onClick={() => onSelect(template)}
      onMouseEnter={handlePreviewStart}
      onMouseLeave={handlePreviewEnd}
      onFocus={handlePreviewStart}
      onBlur={handlePreviewEnd}
    >
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-xl bg-[#14151A]",
          isCurrent && "ring-foreground ring-2 ring-offset-2",
        )}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          preload="metadata"
          className="size-full object-cover"
        />
        {isCurrent && (
          <span className="bg-foreground text-background absolute top-2 left-2 rounded-md px-2 py-0.5 text-[11px] font-bold">
            현재 템플릿
          </span>
        )}
      </div>
      <span className="truncate text-sm font-semibold">{template.name}</span>
      <span className="text-muted-foreground text-xs">
        {template.price?.toLocaleString("ko-KR")}원
      </span>
    </button>
  );
}
