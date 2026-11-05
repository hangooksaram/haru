import { randomUUID } from "crypto";

import { Prisma, prisma } from "@haru/db";

import {
  DraftNotEditableError,
  DraftNotFoundError,
} from "@/features/draft/errors";
import { assertDraftOwner } from "@/features/draft/lib/assertDraftOwner";
import { assertValidPhotoFile } from "@/features/draft/lib/assertValidPhotoFile";
import { getPhotoFileExtension } from "@/features/draft/lib/getPhotoFileExtension";
import { resolveEmptyPhotoLabels } from "@/features/draft/lib/resolveEmptyPhotoLabels";
import { selectAcceptablePhotos } from "@/features/draft/lib/selectAcceptablePhotos";
import { extractSortedPhotoElements } from "@/features/template/lib/extractSortedPhotoElements";

import {
  createDraftPhotoUploadUrl,
  getDraftPhotoSignedUrl,
} from "./draft-photo-storage";

import type { DraftPhoto } from "@/features/draft/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type PhotoFileMeta = {
  contentType: string;
  size: number;
};

type PhotoUpload = {
  path: string;
  token: string;
  label: string;
};

export async function createDraftPhotoUploadUrls(
  supabase: SupabaseClient,
  draftId: string,
  files: PhotoFileMeta[],
  currentUserId: string | null,
  targetLabel?: string,
): Promise<{ uploads: PhotoUpload[]; rejectedCount: number }> {
  files.forEach(assertValidPhotoFile);

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      template: { select: { elements: true } },
      photos: { select: { name: true } },
    },
  });

  if (!draft) throw new DraftNotFoundError(draftId);
  assertDraftOwner(draftId, draft.userId, currentUserId);
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

  const uploads: PhotoUpload[] = [];

  for (const [index, file] of accepted.entries()) {
    const label = emptyLabels[index];
    const path = `${draftId}/${randomUUID()}.${getPhotoFileExtension(file.contentType)}`;
    const { token } = await createDraftPhotoUploadUrl(supabase, path);

    uploads.push({ path, token, label });
  }

  return { uploads, rejectedCount };
}

export async function confirmDraftPhotos(
  supabase: SupabaseClient,
  draftId: string,
  items: { path: string; label: string }[],
  currentUserId: string | null,
): Promise<{ added: DraftPhoto[] }> {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: { template: { select: { elements: true } } },
  });

  if (!draft) throw new DraftNotFoundError(draftId);
  assertDraftOwner(draftId, draft.userId, currentUserId);
  if (draft.status !== "editing") throw new DraftNotEditableError(draftId);

  const labels = extractSortedPhotoElements(draft.template.elements);
  const added: DraftPhoto[] = [];

  for (const item of items) {
    try {
      const photo = await prisma.draftPhoto.create({
        data: {
          draftId,
          storagePath: item.path,
          name: item.label,
          position: labels.indexOf(item.label),
        },
      });

      added.push({
        id: photo.id,
        name: photo.name,
        position: photo.position,
        url: await getDraftPhotoSignedUrl(supabase, item.path),
      });
    } catch (error) {
      // 정책: URL 발급 시점과 확정 시점 사이에 같은 라벨이 먼저 채워지면(동시 작업 등)
      // unique 제약 충돌이 나는데, 이 경우 그 사진만 조용히 건너뛰고 나머지는 계속 처리한다.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }

      throw error;
    }
  }

  return { added };
}
