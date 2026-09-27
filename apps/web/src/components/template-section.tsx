import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";

const templates = [
  { name: "프로포즈", price: "12,000원", color: "#DCEFFB" },
  { name: "결혼기념일", price: "15,000원", color: "#FCE4E4" },
  { name: "생일 축하", price: "9,000원", color: "#FFF3D6" },
  { name: "고백", price: "11,000원", color: "#E7E1F7" },
];

export function TemplateSection() {
  return (
    <section id="templates" className="bg-card py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto mb-13 flex max-w-xl flex-col items-center gap-2.5 text-center">
          <span className="text-[13px] font-bold text-brand-deep">
            템플릿
          </span>
          <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
            어떤 순간이든 어울리는 템플릿
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {templates.map((template, index) => (
            <Reveal key={template.name} delay={index * 0.08}>
              <div className="flex flex-col gap-2.5">
                <div
                  className="flex aspect-3/4 items-end rounded-2xl p-3.5"
                  style={{ backgroundColor: template.color }}
                >
                  <Badge className="bg-background/85 text-foreground">
                    {template.price}
                  </Badge>
                </div>
                <span className="text-sm font-semibold">{template.name}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
