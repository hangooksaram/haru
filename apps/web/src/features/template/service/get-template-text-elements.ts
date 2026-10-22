import { prisma } from "@haru/db";

import { TemplateNotFoundError } from "@/features/draft/errors";
import { extractSortedTextElements } from "@/features/template/lib/extractSortedTextElements";

import type { TemplateTextElement } from "@/features/template/types";

export async function getTemplateTextElements(
  templateId: string,
): Promise<TemplateTextElement[]> {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    select: { elements: true },
  });

  if (!template) throw new TemplateNotFoundError(templateId);

  return extractSortedTextElements(template.elements);
}
