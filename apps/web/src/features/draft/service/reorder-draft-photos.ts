import { prisma } from "@haru/db";

import {
  DraftNotEditableError,
  DraftNotFoundError,
  InvalidPhotoOrderError,
} from "@/features/draft/errors";

export async function reorderDraftPhotos(
  draftId: string,
  photoIds: string[],
): Promise<void> {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: { photos: { select: { id: true } } },
  });

  if (!draft) throw new DraftNotFoundError(draftId);
  if (draft.status !== "editing") throw new DraftNotEditableError(draftId);

  const existingIds = new Set(draft.photos.map((photo) => photo.id));
  const sameSet =
    photoIds.length === existingIds.size &&
    photoIds.every((id) => existingIds.has(id));

  if (!sameSet) {
    throw new InvalidPhotoOrderError(
      "요청한 사진 목록이 시안의 사진 목록과 일치하지 않습니다.",
    );
  }

  await prisma.$transaction(
    photoIds.map((id, position) =>
      prisma.draftPhoto.update({ where: { id }, data: { position } }),
    ),
  );
}
