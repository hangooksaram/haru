import { DraftStepper } from "@/components/draft-stepper";
import { TemplateCard } from "@/components/template-card";

import type { Template } from "@/components/template-card";

export default async function DraftPage() {
  // TODO: 템플릿 변환 기능(노션 "템플릿 변환" 문서) 구현 후 서비스 DB에서 조회하도록 교체
  const templates: Template[] = [];

  return (
    <div className="flex flex-col gap-10 py-10">
      <DraftStepper current={0} />
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        템플릿을 선택해 주세요
      </h1>
      {templates.length === 0 && (
        <p className="text-muted-foreground">등록된 템플릿이 없습니다.</p>
      )}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
