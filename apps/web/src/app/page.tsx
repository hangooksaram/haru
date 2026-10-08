import { SiteHeader } from "@/components/SiteHeader";
import { HeroSection } from "@/components/HeroSection";
import { TrustStrip } from "@/components/TrustStrip";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { TemplateSection } from "@/components/TemplateSection";
import { CtaSection } from "@/components/CtaSection";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <main>
      <div className="mx-auto max-w-[1280px] px-6">
        <SiteHeader />
        <HeroSection />
      </div>

      <TrustStrip />

      <div className="mx-auto max-w-[1280px] px-6">
        <HowItWorksSection />
      </div>

      <TemplateSection />

      <div className="mx-auto max-w-[1280px] px-6">
        <CtaSection />
        <SiteFooter />
      </div>
    </main>
  );
}
