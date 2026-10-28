import { prisma } from "@haru/db";

import {
  DraftForbiddenError,
  DraftNotEditableError,
  DraftNotFoundError,
  InvalidDraftTextError,
} from "@/features/draft/errors";
import { resolveDraftTextElement } from "@/features/draft/lib/resolveDraftTextElement";
import { trimBlankText } from "@/features/draft/lib/trimBlankText";
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
    const matched = resolveDraftTextElement(
      item.type,
      item.name,
      templateTextElements,
    );

    if (!matched) {
      throw new InvalidDraftTextError("시안 템플릿에 없는 텍스트 요소입니다.");
    }

    const trimmed = trimBlankText(item.text);

    if (matched.type === "기본정보" && trimmed === "") {
      throw new InvalidDraftTextError("기본정보는 빈 값으로 저장할 수 없습니다.");
    }

    return { name: matched.name, text: trimmed };
  });

  await prisma.draft.update({
    where: { id: draftId },
    data: { texts: resolved },
  });
}
