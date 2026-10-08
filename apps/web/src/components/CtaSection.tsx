import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section id="start" className="py-20 sm:py-24">
      <Reveal className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          오늘, 소중한 사람에게
          <br />
          영상 한 편을 선물하세요
        </h2>
        <Button asChild size="lg" className="rounded-full px-9 text-base">
          <Link href="/draft">무료로 시안 만들기</Link>
        </Button>
      </Reveal>
    </section>
  );
}
