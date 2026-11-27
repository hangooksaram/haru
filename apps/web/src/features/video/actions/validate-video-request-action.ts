"use server";

import { prisma } from "@haru/db";

import { DraftNotFoundError } from "@/features/draft/errors";
import { assertDraftOwner } from "@/features/draft/lib/assertDraftOwner";
import { isVideoRequestValid } from "@/features/video/lib/isVideoRequestValid";
import { validateVideoRequest } from "@/features/video/service/validate-video-request";
import { createServerClient } from "@/lib/supabase/server";

export type VideoRequestValidation = {
  passed: boolean;
  errors: string[];
};

// 정책: /payment 입장 시 서버가 영상 요청 내용을 검증한다.
export async function validateVideoRequestAction(
  draftId: string,
): Promise<VideoRequestValidation> {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: { photos: true },
  });

  if (!draft) throw new DraftNotFoundError(draftId);
  assertDraftOwner(draftId, draft.userId, data.user?.id ?? null);

  const result = await validateVideoRequest(supabase, {
    templateId: draft.templateId,
    texts: draft.texts as { name: string; text: string }[],
    photos: draft.photos,
  });

  console.log("[validateVideoRequestAction] result", result);

  return { passed: isVideoRequestValid(result), errors: result.errors };
}
