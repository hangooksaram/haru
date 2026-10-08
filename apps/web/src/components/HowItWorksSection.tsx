import { Reveal } from "@/components/Reveal";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    title: "사진과 문구 입력",
    description:
      "템플릿을 고르고 사진을 올린 뒤 순서를 정리하세요. 자막 문구도 입력할 수 있어요.",
  },
  {
    title: "무료 시안 확인",
    description:
      "몇 번이든 무료로 다시 만들어 볼 수 있어요. 마음에 들 때까지 편하게 수정하세요.",
  },
  {
    title: "결제 후 다운로드",
    description: "결제가 끝나면 고화질 영상을 바로 다운로드할 수 있어요.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="py-20 sm:py-24">
      <Reveal className="mx-auto mb-13 flex max-w-xl flex-col items-center gap-2.5 text-center">
        <span className="text-brand-deep text-[13px] font-bold">이용 방법</span>
        <h2 className="font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          세 단계면 충분해요
        </h2>
      </Reveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => (
          <Reveal key={step.title} delay={index * 0.1}>
            <Card className="bg-card ring-border h-full gap-4 rounded-2xl border-0 p-7 shadow-none ring-1">
              <CardContent className="flex flex-col gap-3.5 px-0">
                <div className="bg-brand font-heading text-primary-foreground flex size-10 items-center justify-center rounded-[10px] text-base font-extrabold">
                  {index + 1}
                </div>
                <h3 className="font-heading text-lg font-bold">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
