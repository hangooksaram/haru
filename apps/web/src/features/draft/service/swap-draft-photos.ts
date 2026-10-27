import { prisma } from "@haru/db";

import {
  DraftNotEditableError,
  DraftNotFoundError,
  InvalidPhotoSwapError,
} from "@/features/draft/errors";
import { computePhotoSwap } from "@/features/draft/lib/computePhotoSwap";
import { extractSortedPhotoElements } from "@/features/template/lib/extractSortedPhotoElements";

export async function swapDraftPhotos(
  draftId: string,
  labelA: string,
  labelB: string,
): Promise<void> {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      template: { select: { elements: true } },
      photos: { select: { id: true, name: true } },
    },
  });

  if (!draft) throw new DraftNotFoundError(draftId);
  if (draft.status !== "editing") throw new DraftNotEditableError(draftId);

  const labels = extractSortedPhotoElements(draft.template.elements);

  if (
    labelA === labelB ||
    !labels.includes(labelA) ||
    !labels.includes(labelB)
  ) {
    throw new InvalidPhotoSwapError("유효하지 않은 교체 대상입니다.");
  }

  const photoAtLabelA = draft.photos.find((photo) => photo.name === labelA) ?? null;
  const photoAtLabelB = draft.photos.find((photo) => photo.name === labelB) ?? null;

  const updates = computePhotoSwap(photoAtLabelA, photoAtLabelB, labelA, labelB);

  if (updates.length === 0) return;

  if (photoAtLabelA && photoAtLabelB) {
    // 유니크 제약(draftId, name) 충돌을 피하기 위해 임시 이름을 거쳐 교체한다.
    const temporaryName = `__swap_${photoAtLabelA.id}`;

    await prisma.$transaction([
      prisma.draftPhoto.update({
        where: { id: photoAtLabelA.id },
        data: { name: temporaryName },
      }),
      prisma.draftPhoto.update({
        where: { id: photoAtLabelB.id },
        data: { name: labelA, position: labels.indexOf(labelA) },
      }),
      prisma.draftPhoto.update({
        where: { id: photoAtLabelA.id },
        data: { name: labelB, position: labels.indexOf(labelB) },
      }),
    ]);

    return;
  }

  await prisma.$transaction(
    updates.map((update) =>
      prisma.draftPhoto.update({
        where: { id: update.id },
        data: { name: update.name, position: labels.indexOf(update.name) },
      }),
    ),
  );
}
