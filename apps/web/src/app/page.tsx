import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { TrustStrip } from "@/components/trust-strip";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { TemplateSection } from "@/components/template-section";
import { CtaSection } from "@/components/cta-section";
import { SiteFooter } from "@/components/site-footer";

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
