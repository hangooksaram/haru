import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProfileBadge } from "@/features/auth/components/ProfileBadge";
import { CONTAINER_PADDING_X } from "@/lib/layout";
import { cn } from "@/lib/utils";

type Props = {
  categories?: string[];
  variant?: "full" | "minimal";
};

export function SiteHeader({ categories = [], variant = "full" }: Props) {
  return (
    <header
      className={cn(
        "site-header bg-background/90 sticky top-0 z-50 w-full backdrop-blur-md",
        variant === "minimal" && "site-header--no-shadow",
      )}
    >
      <style>{`
        .site-header{height:64px;padding:0;display:flex;align-items:center}
        @keyframes site-header-shadow{from{box-shadow:0 0 transparent,0 0 transparent}to{box-shadow:var(--shadow-lg)}}
        @supports (animation-timeline: scroll()) {
          .site-header{animation:site-header-shadow linear both;animation-timeline:scroll();animation-range:0 80px}
        }
        .site-header--no-shadow{animation:none !important;box-shadow:none !important}
        @media (prefers-reduced-motion: reduce){
          .site-header{animation:none !important}
        }

        /* 스크롤 연동 구간(0–80px, 560–640px)은 레이아웃 높이에 묶인 값이다. (디자인 시스템 허용 예외 4) */

        /* 홈(풀블리드 영상 히어로) 전용: 영상 위에서는 투명/흰 글자로 시작해 스크롤 시 흰 배경으로 전환 */
        @supports (animation-timeline: scroll()) {
          body:has(.home-hero-video) .site-header{
            animation:site-header-overlay-fade linear both;
            animation-timeline:scroll();
            animation-range:560px 640px;
            background-color:transparent;
            color:white;
            box-shadow:none;
          }
        }
        @keyframes site-header-overlay-fade{
          from{background-color:transparent;color:white;box-shadow:0 0 transparent,0 0 transparent}
          to{background-color:color-mix(in oklch,var(--background) 90%,transparent);color:var(--foreground);box-shadow:var(--shadow-lg)}
        }

        .nav-link{transition:opacity 200ms}
        body:has(.home-hero-video) .nav-group:hover .nav-link{opacity:.5}
        body:has(.home-hero-video) .nav-group .nav-link:hover{opacity:1;font-weight:700}

        .cta-flip{display:block;height:1.2em;overflow:hidden}
        .cta-flip-track{display:flex;flex-direction:column;transition:transform 300ms var(--ease-out)}
        body:has(.home-hero-video) .cta-flip-wrap:hover .cta-flip-track{transform:translateY(-50%)}

        @media (prefers-reduced-motion: reduce){
          body:has(.home-hero-video) .site-header{animation:none !important}
          .nav-link,.cta-flip-track{transition:none !important}
        }
      `}</style>

      <div
        className={cn(
          "mx-auto flex min-h-11 w-full max-w-7xl flex-wrap items-center justify-between gap-4",
          CONTAINER_PADDING_X,
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-black tracking-tight"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" width={22} height={22} />
          haru<span className="text-brand-deep">.</span>
        </Link>
        {variant === "full" ? (
          <>
            <nav className="nav-group order-3 flex w-full justify-start gap-8 sm:order-none sm:w-auto sm:justify-center">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/templates?tag=${encodeURIComponent(category)}`}
                  className="nav-link flex min-h-11 items-center text-base font-bold"
                >
                  {category}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-6">
              <Button
                asChild
                size="lg"
                className="cta-flip-wrap rounded-full px-5 font-bold"
              >
                <Link href="/templates">
                  <span className="cta-flip">
                    <span className="cta-flip-track">
                      <span>시안 만들기</span>
                      <span aria-hidden="true">시안 만들기</span>
                    </span>
                  </span>
                </Link>
              </Button>
              <ProfileBadge />
            </div>
          </>
        ) : (
          <ProfileBadge />
        )}
      </div>
    </header>
  );
}
