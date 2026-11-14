"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/components/video-slides";
import { VIDEO_AUTO_ADVANCE_MS } from "@/components/video-slides";

type Props = {
  slides: HeroSlide[];
};

// 데스크톱(sm 이상)은 DesktopHeroVideo가 대체하므로 이 컴포넌트는 모바일에서만 렌더링된다.
export function VideoSlider({ slides }: Props) {
  const [idx, setIdx] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const touchStartXRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!userPaused) {
        setIdx((current) => (current + 1) % slides.length);
      }
    }, VIDEO_AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [userPaused, slides.length]);

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
            className="block h-2.5 rounded-full transition-all"
            style={{
              width: slideIndex === idx ? 24 : 10,
              backgroundColor:
                slideIndex === idx ? "#38BDF8" : "rgba(255,255,255,0.55)",
            }}
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
        className="relative aspect-video w-full overflow-hidden rounded-[20px] bg-[#14151A] text-[#C7CAD6]"
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

        <div className="absolute inset-x-3 bottom-2 rounded-[14px] bg-[rgba(11,18,32,0.78)] px-3.5 py-2.5 text-sm font-bold text-white">
          {current.title}
        </div>

        <button
          type="button"
          aria-label={muted ? "소리 켜기" : "소리 끄기"}
          aria-pressed={muted}
          onClick={() => setMuted((value) => !value)}
          className="absolute top-2 left-2 flex size-11 items-center justify-center rounded-full bg-[rgba(11,18,32,0.78)]"
        >
          {muted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4z" fill="#fff" />
              <path
                d="M16 9l5 6M21 9l-5 6"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4z" fill="#fff" />
              <path
                d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>

        <div className="absolute top-2 right-2 flex items-center rounded-full bg-[rgba(11,18,32,0.78)] px-1">
          <button
            type="button"
            aria-label={userPaused ? "자동 전환 재생" : "자동 전환 일시정지"}
            onClick={() => setUserPaused((value) => !value)}
            className="flex size-11 items-center justify-center"
          >
            {userPaused ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M7 5l12 7-12 7z" fill="#fff" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="#fff" />
              </svg>
            )}
          </button>
        </div>

        <button
          type="button"
          aria-label="이전 영상"
          onClick={goPrev}
          className="absolute top-1/2 left-2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(11,18,32,0.78)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              fill="none"
              stroke="#fff"
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
          className="absolute top-1/2 right-2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(11,18,32,0.78)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M9 5l7 7-7 7"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-center">{dots}</div>
      <Button
        asChild
        size="lg"
        className="w-full rounded-xl text-[17px] font-bold"
      >
        <Link href={current.href}>이 영상으로 제작하기</Link>
      </Button>
    </div>
  );
}
