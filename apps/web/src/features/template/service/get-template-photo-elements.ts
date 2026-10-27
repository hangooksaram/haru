import { prisma } from "@haru/db";

import { TemplateNotFoundError } from "@/features/draft/errors";
import { extractSortedPhotoElements } from "@/features/template/lib/extractSortedPhotoElements";

export async function getTemplatePhotoElements(
  templateId: string,
): Promise<string[]> {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    select: { elements: true },
  });

  if (!template) throw new TemplateNotFoundError(templateId);

  return extractSortedPhotoElements(template.elements);
}
