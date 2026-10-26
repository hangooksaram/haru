import { prisma } from "@haru/db";

import { DraftForbiddenError } from "@/features/draft/errors";

import { deleteDraftPhoto } from "./draft-photo-storage";

export async function deleteDraft(
  draftId: string,
  currentUserId: string | null,
): Promise<boolean> {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: { photos: true },
  });

  if (!draft) return false;

  if (draft.userId && draft.userId !== currentUserId) {
    throw new DraftForbiddenError(draftId);
  }

  await Promise.all(
    draft.photos.map((photo) => deleteDraftPhoto(photo.storagePath)),
  );
  await prisma.draft.delete({ where: { id: draftId } });

  return true;
}
