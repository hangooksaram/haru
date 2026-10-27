import { randomUUID } from "crypto";

import { prisma } from "@haru/db";

import {
  DraftNotEditableError,
  DraftNotFoundError,
} from "@/features/draft/errors";
import { assertValidPhotoFile } from "@/features/draft/lib/assertValidPhotoFile";
import { getPhotoFileExtension } from "@/features/draft/lib/getPhotoFileExtension";
import { resolveEmptyPhotoLabels } from "@/features/draft/lib/resolveEmptyPhotoLabels";
import { selectAcceptablePhotos } from "@/features/draft/lib/selectAcceptablePhotos";
import { extractSortedPhotoElements } from "@/features/template/lib/extractSortedPhotoElements";

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
  targetLabel?: string,
): Promise<{ added: DraftPhoto[]; rejectedCount: number }> {
  files.forEach(assertValidPhotoFile);

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      template: { select: { elements: true } },
      photos: { select: { name: true } },
    },
  });

  if (!draft) throw new DraftNotFoundError(draftId);
  if (draft.status !== "editing") throw new DraftNotEditableError(draftId);

  const labels = extractSortedPhotoElements(draft.template.elements);
  const emptyLabels = resolveEmptyPhotoLabels(
    labels,
    draft.photos.map((photo) => photo.name),
    targetLabel,
  );
  const { accepted, rejectedCount } = selectAcceptablePhotos(
    files,
    labels.length,
    draft.photos.length,
  );

  const added: DraftPhoto[] = [];

  for (const [index, file] of accepted.entries()) {
    const name = emptyLabels[index];
    const path = `${draftId}/${randomUUID()}.${getPhotoFileExtension(file.contentType)}`;

    await uploadDraftPhoto(path, file.buffer, file.contentType);

    const photo = await prisma.draftPhoto.create({
      data: {
        draftId,
        storagePath: path,
        name,
        position: labels.indexOf(name),
      },
    });

    added.push({
      id: photo.id,
      name: photo.name,
      position: photo.position,
      url: await getDraftPhotoSignedUrl(path),
    });
  }

  return { added, rejectedCount };
}
