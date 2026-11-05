import { prisma } from "@haru/db";

import { assertDraftOwner } from "@/features/draft/lib/assertDraftOwner";

import { getDraftPhotoSignedUrl } from "./draft-photo-storage";

import type { Draft, DraftSavedText } from "@/features/draft/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getDraft(
  supabase: SupabaseClient,
  draftId: string,
  currentUserId: string | null,
): Promise<Draft | null> {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      photos: { orderBy: { position: "asc" } },
    },
  });

  if (!draft) return null;

  assertDraftOwner(draftId, draft.userId, currentUserId);

  const photos = await Promise.all(
    draft.photos.map(async (photo) => ({
      id: photo.id,
      name: photo.name,
      position: photo.position,
      url: await getDraftPhotoSignedUrl(supabase, photo.storagePath),
    })),
  );

  return {
    id: draft.id,
    templateId: draft.templateId,
    status: draft.status,
    photos,
    texts: draft.texts as DraftSavedText[],
  };
}
