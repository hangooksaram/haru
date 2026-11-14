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
    <header className="site-header bg-background/90 sticky top-0 z-50 w-full backdrop-blur-md">
      <style>{`
        .site-header{height:64px;padding:0;display:flex;align-items:center}
        @keyframes site-header-shadow{from{box-shadow:0 0 0 rgba(11,18,32,0)}to{box-shadow:0 6px 24px rgba(11,18,32,.08)}}
        @supports (animation-timeline: scroll()) {
          .site-header{animation:site-header-shadow linear both;animation-timeline:scroll();animation-range:0 80px}
        }
        @media (prefers-reduced-motion: reduce){
          .site-header{animation:none !important}
        }

        /* 홈(풀블리드 영상 히어로) 전용: 영상 위에서는 투명/흰 글자로 시작해 스크롤 시 흰 배경으로 전환 */
        @supports (animation-timeline: scroll()) {
          body:has(.home-hero-video) .site-header{
            animation:site-header-overlay-fade linear both;
            animation-timeline:scroll();
            animation-range:560px 640px;
            background-color:transparent;
            color:#fff;
            box-shadow:none;
          }
        }
        @keyframes site-header-overlay-fade{
          from{background-color:transparent;color:#fff;box-shadow:0 0 0 rgba(11,18,32,0)}
          to{background-color:rgba(255,255,255,.9);color:#111827;box-shadow:0 6px 24px rgba(11,18,32,.08)}
        }

        .nav-link{transition:opacity .2s}
        body:has(.home-hero-video) .nav-group:hover .nav-link{opacity:.5}
        body:has(.home-hero-video) .nav-group .nav-link:hover{opacity:1;font-weight:700}

        .cta-flip{display:block;height:1.2em;overflow:hidden}
        .cta-flip-track{display:flex;flex-direction:column;transition:transform .3s cubic-bezier(.2,.8,.2,1)}
        body:has(.home-hero-video) .cta-flip-wrap:hover .cta-flip-track{transform:translateY(-50%)}

        @media (prefers-reduced-motion: reduce){
          body:has(.home-hero-video) .site-header{animation:none !important}
          .nav-link,.cta-flip-track{transition:none !important}
        }
      `}</style>

      <div
        className={cn(
          "mx-auto flex min-h-11 w-full max-w-[1280px] flex-wrap items-center justify-between gap-4",
          CONTAINER_PADDING_X,
        )}
      >
        <Link href="/" className="text-2xl font-black tracking-tight">
          haru<span className="text-brand-deep">.</span>
        </Link>
        {variant === "full" ? (
          <>
            <nav className="nav-group order-3 flex w-full justify-start gap-8 sm:order-none sm:w-auto sm:justify-center">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/templates?tag=${encodeURIComponent(category)}`}
                  className="nav-link flex min-h-11 items-center text-[15px] font-bold"
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
                <Link href="/templates/tags">
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
