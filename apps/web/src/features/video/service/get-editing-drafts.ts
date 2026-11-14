import { prisma } from "@haru/db";

import type { EditingDraftVideo } from "@/features/video/types";

export async function getEditingDrafts(
  userId: string,
): Promise<EditingDraftVideo[]> {
  const drafts = await prisma.draft.findMany({
    where: { userId, status: "editing", deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: { template: { select: { name: true } } },
  });

  return drafts.map((draft) => ({
    id: draft.id,
    templateId: draft.templateId,
    templateName: draft.template.name,
    updatedAt: draft.updatedAt,
  }));
}
