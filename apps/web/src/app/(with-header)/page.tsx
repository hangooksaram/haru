import { CtaSection } from "@/components/CtaSection";
import { FaqSection } from "@/components/FaqSection";
import { HeroSection } from "@/components/HeroSection";
import { MobileCtaBar } from "@/components/MobileCtaBar";
import { SiteFooter } from "@/components/SiteFooter";
import { VideoSlider } from "@/components/VideoSlider";

export default function HomePage() {
  return (
    <main>
      <div className="mx-auto max-w-[1280px] px-5 sm:px-10 lg:px-16">
        <HeroSection />
      </div>

      <div className="mx-auto max-w-[1280px] px-5 py-2 sm:px-10 sm:py-4 lg:px-16">
        <VideoSlider />
      </div>

      <div className="mx-auto max-w-[1280px] px-5 sm:px-10 lg:px-16">
        <FaqSection />
        <CtaSection />
        <SiteFooter />
      </div>

      <MobileCtaBar />
    </main>
  );
}
