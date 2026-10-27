import { prisma } from "@haru/db";

import { DraftForbiddenError } from "@/features/draft/errors";

import { getDraftPhotoSignedUrl } from "./draft-photo-storage";

import type { Draft } from "@/features/draft/types";

export async function getDraft(
  draftId: string,
  currentUserId: string | null,
): Promise<Draft | null> {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      photos: { orderBy: { position: "asc" } },
      texts: true,
    },
  });

  if (!draft) return null;

  if (draft.userId && draft.userId !== currentUserId) {
    throw new DraftForbiddenError(draftId);
  }

  const photos = await Promise.all(
    draft.photos.map(async (photo) => ({
      id: photo.id,
      name: photo.name,
      position: photo.position,
      url: await getDraftPhotoSignedUrl(photo.storagePath),
    })),
  );

  return {
    id: draft.id,
    templateId: draft.templateId,
    status: draft.status,
    photos,
    texts: draft.texts.map((text) => ({ name: text.name, text: text.text })),
  };
}
