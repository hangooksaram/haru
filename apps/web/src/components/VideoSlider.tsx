"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/components/video-slides";
import { CTA_BUTTON } from "@/lib/styles";
import { cn } from "@/lib/utils";

type Props = {
  slides: HeroSlide[];
};

// 데스크톱(sm 이상)은 DesktopHeroVideo가 대체하므로 이 컴포넌트는 모바일에서만 렌더링된다.
export function VideoSlider({ slides }: Props) {
  const [idx, setIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const touchStartXRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  const goPrev = () =>
    setIdx((current) => (current + slides.length - 1) % slides.length);
  const goNext = () => setIdx((current) => (current + 1) % slides.length);

  if (slides.length === 0) {
    return null;
  }

  const current = slides[idx];

  const dots = (
    <>
      {slides.map((slide, slideIndex) => (
        <button
          key={slide.href}
          type="button"
          aria-label={`영상 ${slideIndex + 1} 보기`}
          onClick={() => setIdx(slideIndex)}
          className="flex h-11 items-center justify-center px-1"
        >
          <span
            className={cn(
              "block h-2.5 rounded-full transition-all",
              slideIndex === idx ? "bg-brand w-6" : "w-2.5 bg-white/60",
            )}
          />
        </button>
      ))}
    </>
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        onTouchStart={(event) => {
          touchStartXRef.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          const dx = event.changedTouches[0].clientX - touchStartXRef.current;
          if (dx < -40) goNext();
          else if (dx > 40) goPrev();
        }}
        className="bg-ink relative aspect-video w-full overflow-hidden rounded-2xl text-white/70"
      >
        <video
          key={current.videoSrc}
          ref={videoRef}
          src={current.videoSrc}
          autoPlay
          loop
          muted={muted}
          playsInline
          className="absolute inset-0 size-full object-cover"
        />

        <div className="bg-ink/80 absolute inset-x-3 bottom-2 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white">
          {current.title}
        </div>

        <button
          type="button"
          aria-label={muted ? "소리 켜기" : "소리 끄기"}
          aria-pressed={muted}
          onClick={() => setMuted((value) => !value)}
          className="bg-ink/80 absolute top-2 left-2 flex size-11 items-center justify-center rounded-full"
        >
          {muted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4z" fill="white" />
              <path
                d="M16 9l5 6M21 9l-5 6"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4z" fill="white" />
              <path
                d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>

        <button
          type="button"
          aria-label="이전 영상"
          onClick={goPrev}
          className="bg-ink/80 absolute top-1/2 left-2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="다음 영상"
          onClick={goNext}
          className="bg-ink/80 absolute top-1/2 right-2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M9 5l7 7-7 7"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-center">{dots}</div>
      <Button asChild size="lg" className={cn(CTA_BUTTON, "w-full")}>
        <Link href={current.href}>이 영상으로 제작하기</Link>
      </Button>
    </div>
  );
}
