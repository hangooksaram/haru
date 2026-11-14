import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProfileBadge } from "@/features/auth/components/ProfileBadge";

type Props = {
  categories?: string[];
  variant?: "full" | "minimal";
};

export function SiteHeader({ categories = [], variant = "full" }: Props) {
  return (
    <header className="site-header bg-background/90 sticky top-0 z-50 w-full py-5 backdrop-blur-md">
      <style>{`
        @keyframes site-header-shadow{from{box-shadow:0 0 0 rgba(11,18,32,0)}to{box-shadow:0 6px 24px rgba(11,18,32,.08)}}
        @keyframes site-header-pad{from{padding-top:20px;padding-bottom:20px}to{padding-top:8px;padding-bottom:8px}}
        @supports (animation-timeline: scroll()) {
          .site-header{animation:site-header-shadow linear both;animation-timeline:scroll();animation-range:0 80px}
          @media (min-width: 640px){
            .site-header{animation:site-header-shadow linear both, site-header-pad linear both;animation-timeline:scroll(), scroll();animation-range:0 80px}
          }
        }
        @media (prefers-reduced-motion: reduce){
          .site-header{animation:none !important}
        }
      `}</style>

      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-4 px-5 sm:px-10 lg:px-16">
        <Link href="/" className="text-2xl font-black tracking-tight">
          haru<span className="text-brand-deep">.</span>
        </Link>
        {variant === "full" ? (
          <>
            <nav className="order-3 flex w-full justify-start gap-8 sm:order-none sm:w-auto sm:justify-center">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/templates?tag=${encodeURIComponent(category)}`}
                  className="flex min-h-11 items-center text-[15px] font-bold"
                >
                  {category}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-6">
              <Button asChild size="lg" className="rounded-full px-5 font-bold">
                <Link href="/templates/tags">시안 만들기</Link>
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
