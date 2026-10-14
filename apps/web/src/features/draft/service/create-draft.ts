import { prisma } from "@haru/db";

import { TemplateNotFoundError } from "@/features/draft/errors";

export async function createDraft(templateId: string): Promise<{ id: string }> {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    select: { id: true },
  });

  if (!template) throw new TemplateNotFoundError(templateId);

  const draft = await prisma.draft.create({
    data: { templateId },
    select: { id: true },
  });

  return draft;
}
