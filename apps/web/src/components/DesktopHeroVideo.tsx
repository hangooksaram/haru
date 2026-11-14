"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CREATE_FROM_VIDEO_HREF,
  VIDEO_AUTO_ADVANCE_MS,
  VIDEO_SLIDES,
} from "@/components/video-slides";

// 모바일은 HeroSection + VideoSlider가 대체하므로 이 컴포넌트는 데스크톱(sm 이상)에서만 보인다.
// 루트 요소의 home-hero-video 클래스는 SiteHeader가 :has()로 감지해 투명 헤더로 전환하는 마커다.
export function DesktopHeroVideo() {
  const [idx, setIdx] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const hoverPausedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!userPaused && !hoverPausedRef.current) {
        setIdx((current) => (current + 1) % VIDEO_SLIDES.length);
      }
    }, VIDEO_AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [userPaused]);

  const goPrev = () =>
    setIdx((current) => (current + VIDEO_SLIDES.length - 1) % VIDEO_SLIDES.length);
  const goNext = () => setIdx((current) => (current + 1) % VIDEO_SLIDES.length);

  const current = VIDEO_SLIDES[idx];

  return (
    <div
      onMouseEnter={() => {
        hoverPausedRef.current = true;
      }}
      onMouseLeave={() => {
        hoverPausedRef.current = false;
      }}
      className="home-hero-video relative hidden h-[760px] w-full -mt-16 overflow-hidden bg-[#14151A] text-[#C7CAD6] sm:block"
    >
      <style>{`
        .hero-vid-word{display:inline-block;animation:hero-vid-rise .8s cubic-bezier(.2,.8,.2,1) both}
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
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(11,18,32,0.78) 0%, rgba(11,18,32,0.4) 45%, rgba(11,18,32,0) 72%), linear-gradient(0deg, rgba(11,18,32,0.7) 0%, rgba(11,18,32,0) 40%)",
        }}
      />

      <div className="absolute top-[168px] left-[72px] max-w-[640px]">
        <h1 className="m-0 text-[44px] leading-[1.3] font-bold tracking-[-1.2px] text-white">
          <span className="hero-vid-word" style={{ animationDelay: ".05s" }}>
            영상 시안 제작,
          </span>
          <br />
          <span
            className="hero-vid-word mt-1.5 rounded-[10px] bg-[#38BDF8] px-3 text-[#0B1220]"
            style={{ animationDelay: ".25s" }}
          >
            무제한 무료
          </span>
        </h1>
        <p
          className="hero-vid-word mt-4 text-lg font-normal text-[#E5E7EB]"
          style={{ animationDelay: ".6s" }}
        >
          마음에 들면 그때 주문하세요
        </p>
      </div>

      <div className="absolute top-[88px] right-[72px] flex items-center rounded-full bg-[rgba(11,18,32,0.78)] px-2">
        <button
          type="button"
          aria-label={userPaused ? "자동 전환 재생" : "자동 전환 일시정지"}
          onClick={() => setUserPaused((value) => !value)}
          className="flex size-11 items-center justify-center"
        >
          {userPaused ? (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 5l12 7-12 7z" fill="#fff" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="#fff" />
            </svg>
          )}
        </button>
        {VIDEO_SLIDES.map((slide, slideIndex) => (
          <button
            key={slide.title}
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
      </div>

      <div className="absolute bottom-14 left-[72px] flex max-w-[560px] flex-col items-start gap-3 rounded-[20px] bg-[rgba(11,18,32,0.78)] px-7 py-6 text-left text-white">
        <span className="text-xl leading-[1.3] font-bold tracking-[-0.3px]">
          {current.title}
        </span>
        <Button asChild size="lg" className="rounded-xl px-6 font-bold">
          <Link href={CREATE_FROM_VIDEO_HREF}>이 영상으로 제작하기</Link>
        </Button>
      </div>

      <div className="absolute bottom-14 right-[72px] flex items-center gap-3">
        <button
          type="button"
          aria-label={muted ? "소리 켜기" : "소리 끄기"}
          aria-pressed={muted}
          onClick={() => setMuted((value) => !value)}
          className="flex size-12 items-center justify-center rounded-full bg-[rgba(11,18,32,0.78)]"
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
        <button
          type="button"
          aria-label="이전 영상"
          onClick={goPrev}
          className="flex size-12 items-center justify-center rounded-full bg-[rgba(11,18,32,0.78)]"
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
          className="flex size-12 items-center justify-center rounded-full bg-[rgba(11,18,32,0.78)]"
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
    </div>
  );
}
