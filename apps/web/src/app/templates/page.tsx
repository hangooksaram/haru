import { DraftStepper } from "@/components/DraftStepper";
import { TemplateListFilter } from "@/components/TemplateListFilter";
import { getPublicTemplates } from "@/features/template/service/get-public-templates";

type Props = {
  searchParams: Promise<{ tag?: string }>;
};

export default async function TemplatesPage({ searchParams }: Props) {
  const { tag } = await searchParams;
  const templates = await getPublicTemplates();

  return (
    <div className="flex flex-col gap-10 py-10">
      <DraftStepper current={0} />
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        템플릿을 선택해 주세요
      </h1>
      <TemplateListFilter templates={templates} initialTag={tag} />
    </div>
  );
}
