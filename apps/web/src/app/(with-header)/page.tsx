import { CtaSection } from "@/components/CtaSection";
import { DesktopHeroVideo } from "@/components/DesktopHeroVideo";
import { FaqSection } from "@/components/FaqSection";
import { HeroSection } from "@/components/HeroSection";
import { MobileCtaBar } from "@/components/MobileCtaBar";
import { SiteFooter } from "@/components/SiteFooter";
import { VideoSlider } from "@/components/VideoSlider";
import { CONTAINER_PADDING_X } from "@/lib/layout";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main>
      <DesktopHeroVideo />

      <div className="sm:hidden">
        <div className="mx-auto max-w-[1280px] px-5">
          <HeroSection />
        </div>
        <div className="mx-auto max-w-[1280px] px-5 py-2">
          <VideoSlider />
        </div>
      </div>

      <div className={cn("mx-auto max-w-[1280px]", CONTAINER_PADDING_X)}>
        <FaqSection />
        <CtaSection />
        <SiteFooter />
      </div>

      <MobileCtaBar />
    </main>
  );
}
