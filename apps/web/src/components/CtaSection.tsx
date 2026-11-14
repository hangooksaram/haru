import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="bg-brand-soft my-6 rounded-[24px] px-6 py-11 text-center sm:my-0 sm:rounded-[32px] sm:px-8 sm:py-20">
      <h2 className="font-heading text-[28px] font-black tracking-tight sm:text-[44px] sm:tracking-[-1.5px]">
        아직 시작 전이신가요?
      </h2>
      <p className="text-muted-foreground mt-2 text-[15px] sm:mt-3 sm:text-lg">
        지금 시안부터 만들어 보세요.
      </p>
      <Button asChild size="lg" className="mt-6 h-14 w-full rounded-xl px-11 text-[17px] font-bold sm:mt-8 sm:w-auto">
        <Link href="/templates/tags">무료로 시안 만들기</Link>
      </Button>
    </section>
  );
}
