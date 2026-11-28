import { prisma } from "@haru/db";

import { resolveDraftResumeStep } from "@/features/draft/lib/resolveDraftResumeStep";

import type { DraftSavedText } from "@/features/draft/types";
import type { EditingDraftVideo } from "@/features/video/types";

export async function getEditingDrafts(
  userId: string,
): Promise<EditingDraftVideo[]> {
  const drafts = await prisma.draft.findMany({
    where: { userId, status: "editing", deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: {
      template: { select: { name: true, elements: true } },
      photos: { select: { name: true } },
    },
  });

  return drafts.map((draft) => ({
    id: draft.id,
    templateId: draft.templateId,
    templateName: draft.template.name,
    updatedAt: draft.updatedAt,
    resumeStep: resolveDraftResumeStep({
      lastStep: draft.lastStep,
      templateElements: draft.template.elements,
      texts: draft.texts as DraftSavedText[],
      photoNames: draft.photos.map(({ name }) => name),
    }),
  }));
}
