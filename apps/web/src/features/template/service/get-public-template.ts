import { prisma } from "@haru/db";

import { TemplateNotFoundError } from "@/features/draft/errors";
import { countPhotoElements } from "@/features/template/lib/countPhotoElements";
import { resolveTemplateSummary } from "@/features/template/lib/resolveTemplateSummary";

import type {
  TemplateDetail,
  TemplateLang,
  TemplateSummary,
} from "@/features/template/types";

// 공개 처리된 템플릿 1건을 조회한다. 없거나 공개하지 않은 템플릿이면 TemplateNotFoundError.
export async function getPublicTemplate(
  templateId: string,
  lang: TemplateLang,
): Promise<TemplateDetail> {
  const template = await prisma.template.findFirst({
    where: { id: templateId, isActive: true },
    select: {
      id: true,
      name: true,
      price: true,
      tags: true,
      duration: true,
      elements: true,
      summary: true,
    },
  });

  if (!template) throw new TemplateNotFoundError(templateId);

  return {
    id: template.id,
    name: template.name,
    price: template.price,
    tags: template.tags,
    duration: template.duration,
    photoCount: countPhotoElements(template.elements),
    summary: resolveTemplateSummary(
      template.summary as TemplateSummary | null,
      lang,
    ),
  };
}
