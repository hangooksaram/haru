import { randomUUID } from "crypto";

import { prisma } from "@haru/db";

import {
  DraftNotEditableError,
  DraftPhotoNotFoundError,
} from "@/features/draft/errors";
import { assertDraftOwner } from "@/features/draft/lib/assertDraftOwner";
import { assertValidPhotoFile } from "@/features/draft/lib/assertValidPhotoFile";
import { getPhotoFileExtension } from "@/features/draft/lib/getPhotoFileExtension";

import {
  deleteDraftPhoto,
  getDraftPhotoSignedUrl,
  uploadDraftPhoto,
} from "./draft-photo-storage";

import type { DraftPhoto } from "@/features/draft/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type PhotoFileInput = {
  buffer: Buffer;
  contentType: string;
  size: number;
};

export async function replaceDraftPhoto(
  supabase: SupabaseClient,
  photoId: string,
  file: PhotoFileInput,
  currentUserId: string | null,
): Promise<DraftPhoto> {
  assertValidPhotoFile(file);

  const photo = await prisma.draftPhoto.findUnique({
    where: { id: photoId },
    include: { draft: { select: { status: true, userId: true } } },
  });

  if (!photo) throw new DraftPhotoNotFoundError(photoId);
  assertDraftOwner(photo.draftId, photo.draft.userId, currentUserId);
  if (photo.draft.status !== "editing")
    throw new DraftNotEditableError(photoId);

  const path = `${photo.draftId}/${randomUUID()}.${getPhotoFileExtension(file.contentType)}`;

  await uploadDraftPhoto(supabase, path, file.buffer, file.contentType);
  await deleteDraftPhoto(supabase, photo.storagePath);

  const updated = await prisma.draftPhoto.update({
    where: { id: photoId },
    data: { storagePath: path },
  });

  return {
    id: updated.id,
    name: updated.name,
    position: updated.position,
    url: await getDraftPhotoSignedUrl(supabase, path),
  };
}
