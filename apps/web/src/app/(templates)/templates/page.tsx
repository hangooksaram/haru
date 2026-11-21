import { TemplateListFilter } from "@/components/TemplateListFilter";
import { extractUniqueTags } from "@/features/template/lib/extractUniqueTags";
import { getPublicTemplates } from "@/features/template/service/get-public-templates";

type Props = {
  searchParams: Promise<{ tag?: string }>;
};

export default async function TemplatesPage({ searchParams }: Props) {
  const { tag } = await searchParams;
  const templates = await getPublicTemplates();
  const tagOptions = extractUniqueTags(
    templates.map((template) => template.tags),
  );

  return (
    <div className="flex flex-col gap-4 py-4">
      <TemplateListFilter
        templates={templates}
        tagOptions={tagOptions}
        initialTag={tag}
      />
    </div>
  );
}
