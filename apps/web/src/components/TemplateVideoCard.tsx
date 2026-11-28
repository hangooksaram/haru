"use client";

import Link from "next/link";
import { useRef } from "react";

import type { Template } from "@/features/template/types";

function formatDuration(seconds: number): string {
  const totalSeconds = Math.round(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

type Props = {
  template: Template;
  videoSrc: string;
};

const PREVIEW_PLAYBACK_RATE = 8;

// 영상 둘러보기 리스트의 영상 카드. 템플릿 고르기 화면 등 다른 곳에서도 재사용한다.
export function TemplateVideoCard({ template, videoSrc }: Props) {
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
    <Link
      href={`/draft/${template.id}`}
      className="group flex flex-col gap-3"
      onMouseEnter={handlePreviewStart}
      onMouseLeave={handlePreviewEnd}
      onFocus={handlePreviewStart}
      onBlur={handlePreviewEnd}
    >
      <div className="bg-ink relative aspect-video overflow-hidden rounded-2xl">
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          preload="metadata"
          className="size-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold">{template.name}</span>
        {template.summary?.ko && (
          <span className="text-muted-foreground text-xs">
            {template.summary.ko}
          </span>
        )}
        <span className="text-muted-foreground text-xs">
          {formatDuration(template.duration)} · 사진 {template.photoCount}장
        </span>
        {template.price !== null && (
          <span className="text-brand-deep text-sm font-bold">
            {template.price.toLocaleString("ko-KR")}원
          </span>
        )}
      </div>
    </Link>
  );
}
