import { CtaSection } from "@/components/CtaSection";
import { DesktopHeroVideo } from "@/components/DesktopHeroVideo";
import { FaqSection } from "@/components/FaqSection";
import { HeroSection } from "@/components/HeroSection";
import { MobileCtaBar } from "@/components/MobileCtaBar";
import { SiteFooter } from "@/components/SiteFooter";
import { VideoSlider } from "@/components/VideoSlider";

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

      <div className="mx-auto max-w-[1280px] px-5 sm:px-10 lg:px-[72px]">
        <FaqSection />
        <CtaSection />
        <SiteFooter />
      </div>

      <MobileCtaBar />
    </main>
  );
}
