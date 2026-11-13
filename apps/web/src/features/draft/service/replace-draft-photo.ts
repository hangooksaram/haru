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
  createDraftPhotoUploadUrl,
  deleteDraftPhoto,
  getDraftPhotoSignedUrl,
} from "./draft-photo-storage";

import type { DraftPhoto } from "@/features/draft/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type PhotoFileMeta = {
  contentType: string;
  size: number;
};

export async function createReplaceDraftPhotoUploadUrl(
  supabase: SupabaseClient,
  photoId: string,
  file: PhotoFileMeta,
  currentUserId: string | null,
): Promise<{ path: string; token: string }> {
  assertValidPhotoFile(file);

  const photo = await prisma.draftPhoto.findUnique({
    where: { id: photoId },
    include: {
      draft: { select: { status: true, userId: true, deletedAt: true } },
    },
  });

  if (!photo) throw new DraftPhotoNotFoundError(photoId);
  if (photo.draft.deletedAt) throw new DraftPhotoNotFoundError(photoId);
  assertDraftOwner(photo.draftId, photo.draft.userId, currentUserId);
  if (photo.draft.status !== "editing")
    throw new DraftNotEditableError(photoId);

  const path = `${photo.draftId}/${randomUUID()}.${getPhotoFileExtension(file.contentType)}`;
  const { token } = await createDraftPhotoUploadUrl(supabase, path);

  return { path, token };
}

export async function confirmReplaceDraftPhoto(
  supabase: SupabaseClient,
  photoId: string,
  path: string,
  currentUserId: string | null,
): Promise<DraftPhoto> {
  const photo = await prisma.draftPhoto.findUnique({
    where: { id: photoId },
    include: {
      draft: { select: { status: true, userId: true, deletedAt: true } },
    },
  });

  if (!photo) throw new DraftPhotoNotFoundError(photoId);
  if (photo.draft.deletedAt) throw new DraftPhotoNotFoundError(photoId);
  assertDraftOwner(photo.draftId, photo.draft.userId, currentUserId);
  if (photo.draft.status !== "editing")
    throw new DraftNotEditableError(photoId);

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
