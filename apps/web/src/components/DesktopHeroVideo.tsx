"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/components/video-slides";
import { CONTAINER_INSET_LEFT, CONTAINER_INSET_RIGHT } from "@/lib/layout";
import { HERO_TITLE } from "@/lib/styles";
import { cn } from "@/lib/utils";

type Props = {
  slides: HeroSlide[];
};

// 모바일은 HeroSection + VideoSlider가 대체하므로 이 컴포넌트는 데스크톱(sm 이상)에서만 보인다.
// 루트 요소의 home-hero-video 클래스는 SiteHeader가 :has()로 감지해 투명 헤더로 전환하는 마커다.
export function DesktopHeroVideo({ slides }: Props) {
  const [idx, setIdx] = useState(0);
  const [muted, setMuted] = useState(true);
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

  return (
    <div className="home-hero-video relative -mt-16 hidden bg-ink h-190 w-full overflow-hidden text-white/70 sm:block">
      {/* 등장 애니메이션의 키프레임·지연 값은 디자인 시스템 허용 예외(3)다.
          지연은 클래스로 주므로 animation 축약형 대신 개별 속성을 써서 지연을 덮어쓰지 않는다. */}
      <style>{`
        .hero-vid-word{display:inline-block;animation-name:hero-vid-rise;animation-duration:.8s;animation-timing-function:cubic-bezier(.2,.8,.2,1);animation-fill-mode:both}
        @keyframes hero-vid-rise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion: reduce){.hero-vid-word{animation:none !important}}
      `}</style>

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
      <div className="from-ink/80 via-ink/40 absolute inset-0 bg-linear-to-r via-45% to-transparent to-70%" />
      <div className="from-ink/70 absolute inset-0 bg-linear-to-t to-transparent to-40%" />

      <div className="relative mx-auto h-full max-w-7xl">
        <div
          className={cn(
            "absolute top-42 max-w-160",
            CONTAINER_INSET_LEFT,
          )}
        >
          <h1 className={cn(HERO_TITLE, "m-0 text-white")}>
            <span className="hero-vid-word [animation-delay:.05s]">
              영상 시안 제작,
            </span>
            <br />
            <span
              className="hero-vid-word bg-primary text-primary-foreground mt-1.5 rounded-lg px-3 [animation-delay:.25s]"
            >
              무제한 무료
            </span>
          </h1>
          <p
            className="hero-vid-word mt-4 text-lg font-normal text-white/90 [animation-delay:.6s]"
          >
            마음에 들면 그때 주문하세요
          </p>
        </div>

        <div
          className={cn(
            "bg-ink/80 absolute top-22 flex items-center rounded-full px-2",
            CONTAINER_INSET_RIGHT,
          )}
        >
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
        </div>

        <div
          className={cn(
            "bg-ink/80 absolute bottom-14 flex max-w-140 flex-col items-start gap-3 rounded-2xl px-7 py-6 text-left text-white",
            CONTAINER_INSET_LEFT,
          )}
        >
          <span className="text-xl leading-snug font-bold tracking-tight">
            {current.title}
          </span>
          <Button asChild size="lg" className="rounded-xl px-6 font-bold">
            <Link href={current.href}>이 영상으로 제작하기</Link>
          </Button>
        </div>

        <div
          className={cn(
            "absolute bottom-14 flex items-center gap-3",
            CONTAINER_INSET_RIGHT,
          )}
        >
          <button
            type="button"
            aria-label={muted ? "소리 켜기" : "소리 끄기"}
            aria-pressed={muted}
            onClick={() => setMuted((value) => !value)}
            className="flex size-12 items-center justify-center rounded-full bg-ink/80"
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
            className="flex size-12 items-center justify-center rounded-full bg-ink/80"
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
            className="flex size-12 items-center justify-center rounded-full bg-ink/80"
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
      </div>
    </div>
  );
}
