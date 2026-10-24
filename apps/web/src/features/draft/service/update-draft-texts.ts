import { prisma } from "@haru/db";

import {
  DraftForbiddenError,
  DraftNotEditableError,
  DraftNotFoundError,
  InvalidDraftTextError,
} from "@/features/draft/errors";
import { resolveDraftTextElementName } from "@/features/draft/lib/resolveDraftTextElementName";
import { extractSortedTextElements } from "@/features/template/lib/extractSortedTextElements";

import type { DraftTextInput } from "@/features/draft/types";

export async function updateDraftTexts(
  draftId: string,
  texts: DraftTextInput[],
  currentUserId: string | null,
): Promise<void> {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: { template: { select: { elements: true } } },
  });

  if (!draft) throw new DraftNotFoundError(draftId);
  if (draft.userId && draft.userId !== currentUserId) {
    throw new DraftForbiddenError(draftId);
  }
  if (draft.status !== "editing") throw new DraftNotEditableError(draftId);

  const templateTextElements = extractSortedTextElements(
    draft.template.elements,
  );

  const resolved = texts.map((item) => {
    const name = resolveDraftTextElementName(
      item.type,
      item.name,
      templateTextElements,
    );

    if (!name) {
      throw new InvalidDraftTextError("시안 템플릿에 없는 텍스트 요소입니다.");
    }

    return { name, text: item.text.trim() };
  });

  await prisma.$transaction(
    resolved.map(({ name, text }) =>
      prisma.draftText.upsert({
        where: { draftId_name: { draftId, name } },
        create: { draftId, name, text },
        update: { text },
      }),
    ),
  );
}
