import { randomUUID } from "crypto";

import { prisma } from "@haru/db";

import {
  DraftNotEditableError,
  DraftNotFoundError,
} from "@/features/draft/errors";
import { assertValidPhotoFile } from "@/features/draft/lib/assertValidPhotoFile";
import { getPhotoFileExtension } from "@/features/draft/lib/getPhotoFileExtension";
import { countPhotoElements } from "@/features/template/lib/countPhotoElements";

import {
  getDraftPhotoSignedUrl,
  uploadDraftPhoto,
} from "./draft-photo-storage";

import type { DraftPhoto } from "@/features/draft/types";

type PhotoFileInput = {
  buffer: Buffer;
  contentType: string;
  size: number;
};

export async function addDraftPhotos(
  draftId: string,
  files: PhotoFileInput[],
): Promise<{ added: DraftPhoto[]; rejectedCount: number }> {
  files.forEach(assertValidPhotoFile);

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      template: { select: { elements: true } },
      photos: { select: { id: true } },
    },
  });

  if (!draft) throw new DraftNotFoundError(draftId);
  if (draft.status !== "editing") throw new DraftNotEditableError(draftId);

  const slotCount = countPhotoElements(draft.template.elements);
  const remaining = Math.max(0, slotCount - draft.photos.length);
  const accepted = files.slice(0, remaining);
  const rejectedCount = files.length - accepted.length;

  const added: DraftPhoto[] = [];

  for (const [index, file] of accepted.entries()) {
    const path = `${draftId}/${randomUUID()}.${getPhotoFileExtension(file.contentType)}`;

    await uploadDraftPhoto(path, file.buffer, file.contentType);

    const photo = await prisma.draftPhoto.create({
      data: {
        draftId,
        storagePath: path,
        position: draft.photos.length + index,
      },
    });

    added.push({
      id: photo.id,
      position: photo.position,
      url: await getDraftPhotoSignedUrl(path),
    });
  }

  return { added, rejectedCount };
}
