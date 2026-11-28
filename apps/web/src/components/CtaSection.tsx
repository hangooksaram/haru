import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CTA_BUTTON, SECTION_TITLE } from "@/lib/styles";
import { cn } from "@/lib/utils";

export function CtaSection() {
  return (
    <section className="bg-brand-soft my-6 rounded-3xl px-6 py-11 text-center sm:my-0 sm:rounded-4xl sm:px-8 sm:py-20">
      <h2 className={SECTION_TITLE}>
        아직 시작 전이신가요?
      </h2>
      <p className="text-muted-foreground mt-2 text-base sm:mt-3 sm:text-lg">
        지금 시안부터 만들어 보세요.
      </p>
      <Button
        asChild
        size="lg"
        className={cn(CTA_BUTTON, "mt-6 w-full px-11 sm:mt-8 sm:w-auto")}
      >
        <Link href="/templates">무료로 시안 만들기</Link>
      </Button>
    </section>
  );
}
