import { randomUUID } from "crypto";

import { prisma } from "@haru/db";

import {
  DraftNotEditableError,
  DraftPhotoNotFoundError,
} from "@/features/draft/errors";
import { assertValidPhotoFile } from "@/features/draft/lib/assertValidPhotoFile";
import { getPhotoFileExtension } from "@/features/draft/lib/getPhotoFileExtension";

import {
  deleteDraftPhoto,
  getDraftPhotoSignedUrl,
  uploadDraftPhoto,
} from "./draft-photo-storage";

import type { DraftPhoto } from "@/features/draft/types";

type PhotoFileInput = {
  buffer: Buffer;
  contentType: string;
  size: number;
};

export async function replaceDraftPhoto(
  photoId: string,
  file: PhotoFileInput,
): Promise<DraftPhoto> {
  assertValidPhotoFile(file);

  const photo = await prisma.draftPhoto.findUnique({
    where: { id: photoId },
    include: { draft: { select: { status: true } } },
  });

  if (!photo) throw new DraftPhotoNotFoundError(photoId);
  if (photo.draft.status !== "editing")
    throw new DraftNotEditableError(photoId);

  const path = `${photo.draftId}/${randomUUID()}.${getPhotoFileExtension(file.contentType)}`;

  await uploadDraftPhoto(path, file.buffer, file.contentType);
  await deleteDraftPhoto(photo.storagePath);

  const updated = await prisma.draftPhoto.update({
    where: { id: photoId },
    data: { storagePath: path },
  });

  return {
    id: updated.id,
    position: updated.position,
    url: await getDraftPhotoSignedUrl(path),
  };
}
