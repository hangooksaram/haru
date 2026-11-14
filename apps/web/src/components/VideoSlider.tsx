"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

// 아직 확정된 대표 영상 4편이 없어 자리만 잡아둔 임시 데이터. 실제 템플릿이 정해지면 title/href를 교체한다.
const SLIDES = [
  { title: "[영상 ① 제목]" },
  { title: "[영상 ② 제목]" },
  { title: "[영상 ③ 제목]" },
  { title: "[영상 ④ 제목]" },
];

const CREATE_FROM_VIDEO_HREF = "/templates/tags";
const AUTO_ADVANCE_MS = 5000;

export function VideoSlider() {
  const [idx, setIdx] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const hoverPausedRef = useRef(false);
  const touchStartXRef = useRef(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!userPaused && !hoverPausedRef.current) {
        setIdx((current) => (current + 1) % SLIDES.length);
      }
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [userPaused]);

  const goPrev = () => setIdx((current) => (current + SLIDES.length - 1) % SLIDES.length);
  const goNext = () => setIdx((current) => (current + 1) % SLIDES.length);

  const current = SLIDES[idx];

  const dots = (
    <>
      {SLIDES.map((slide, slideIndex) => (
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
              backgroundColor: slideIndex === idx ? "#38BDF8" : "rgba(255,255,255,0.55)",
            }}
          />
        </button>
      ))}
    </>
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        onMouseEnter={() => {
          hoverPausedRef.current = true;
        }}
        onMouseLeave={() => {
          hoverPausedRef.current = false;
        }}
        onTouchStart={(event) => {
          touchStartXRef.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          const dx = event.changedTouches[0].clientX - touchStartXRef.current;
          if (dx < -40) goNext();
          else if (dx > 40) goPrev();
        }}
        className="relative aspect-video w-full overflow-hidden rounded-[20px] bg-[#14151A] text-[#C7CAD6] sm:rounded-[28px]"
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 text-sm">
          <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="11" fill="none" stroke="#C7CAD6" />
            <path d="M10 8l6 4-6 4z" fill="#C7CAD6" />
          </svg>
          <span>영상 자리 · 16:9 음소거 자동 재생</span>
        </div>

        {/* 제목 + CTA: 데스크톱은 영상 위 좌하단 패널에 함께, 모바일은 하단 바에 제목만 */}
        <div className="absolute bottom-6 left-6 hidden max-w-[560px] flex-col items-start gap-3 rounded-[20px] bg-[rgba(11,18,32,0.78)] px-7 py-6 text-white sm:flex">
          <span className="text-[28px] leading-[1.25] font-black tracking-[-0.5px]">
            {current.title}
          </span>
          <Button asChild size="lg" className="rounded-xl px-6 font-bold">
            <Link href={CREATE_FROM_VIDEO_HREF}>이 영상으로 제작하기</Link>
          </Button>
        </div>
        <div className="absolute inset-x-3 bottom-2 rounded-[14px] bg-[rgba(11,18,32,0.78)] px-3.5 py-2.5 text-sm font-bold text-white sm:hidden">
          {current.title}
        </div>

        <button
          type="button"
          aria-label={muted ? "소리 켜기" : "소리 끄기"}
          aria-pressed={muted}
          onClick={() => setMuted((value) => !value)}
          className="absolute top-2 left-2 flex size-11 items-center justify-center rounded-full bg-[rgba(11,18,32,0.78)] sm:top-5 sm:left-6"
        >
          {muted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4z" fill="#fff" />
              <path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
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

        {/* 일시정지 버튼: 데스크톱은 점 인디케이터와 한 묶음, 모바일은 단독 */}
        <div className="absolute top-2 right-2 flex items-center rounded-full bg-[rgba(11,18,32,0.78)] px-1 sm:top-5 sm:right-6">
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
          <div className="hidden items-center gap-1 pr-1 sm:flex">{dots}</div>
        </div>

        <button
          type="button"
          aria-label="이전 영상"
          onClick={goPrev}
          className="absolute top-1/2 left-2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(11,18,32,0.78)] sm:top-auto sm:right-[92px] sm:bottom-6 sm:left-auto sm:size-12 sm:translate-y-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="다음 영상"
          onClick={goNext}
          className="absolute top-1/2 right-2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(11,18,32,0.78)] sm:top-auto sm:right-6 sm:bottom-6 sm:size-12 sm:translate-y-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 모바일: 점 인디케이터와 CTA 버튼을 영상 아래 별도로 노출 */}
      <div className="flex items-center justify-center sm:hidden">{dots}</div>
      <Button asChild size="lg" className="w-full rounded-xl text-[17px] font-bold sm:hidden">
        <Link href={CREATE_FROM_VIDEO_HREF}>이 영상으로 제작하기</Link>
      </Button>
    </div>
  );
}
