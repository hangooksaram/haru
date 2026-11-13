import { prisma } from "@haru/db";

import { assertDraftOwner } from "@/features/draft/lib/assertDraftOwner";

import { deleteDraftPhoto } from "./draft-photo-storage";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function deleteDraft(
  supabase: SupabaseClient,
  draftId: string,
  currentUserId: string | null,
): Promise<boolean> {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: { photos: true },
  });

  if (!draft) return false;
  if (draft.deletedAt) return false;

  assertDraftOwner(draftId, draft.userId, currentUserId);

  await Promise.all(
    draft.photos.map((photo) => deleteDraftPhoto(supabase, photo.storagePath)),
  );
  await prisma.draft.delete({ where: { id: draftId } });

  return true;
}
