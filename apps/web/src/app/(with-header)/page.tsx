import { CtaSection } from "@/components/CtaSection";
import { DesktopHeroVideo } from "@/components/DesktopHeroVideo";
import { FaqSection } from "@/components/FaqSection";
import { HeroSection } from "@/components/HeroSection";
import { MobileCtaBar } from "@/components/MobileCtaBar";
import { SiteFooter } from "@/components/SiteFooter";
import { buildHeroSlides } from "@/components/video-slides";
import { VideoSlider } from "@/components/VideoSlider";
import { getHeroTemplates } from "@/features/template/service/get-hero-templates";
import { CONTAINER_PADDING_X } from "@/lib/layout";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const heroTemplates = await getHeroTemplates();
  const slides = buildHeroSlides(heroTemplates);

  return (
    <main>
      <DesktopHeroVideo slides={slides} />

      <div className="sm:hidden">
        <div className="mx-auto max-w-[1280px] px-5">
          <HeroSection />
        </div>
        <div className="mx-auto max-w-[1280px] px-5 py-2">
          <VideoSlider slides={slides} />
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
