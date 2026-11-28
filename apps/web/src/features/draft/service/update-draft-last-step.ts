import { prisma } from "@haru/db";

import { assertDraftOwner } from "@/features/draft/lib/assertDraftOwner";
import { isLaterDraftStep } from "@/features/draft/lib/isLaterDraftStep";

import type { DraftStep } from "@/features/draft/types";

// 유저가 가장 멀리 진행한 시안 단계를 저장한다. 시안이 없거나 삭제됐으면 false.
export async function updateDraftLastStep(
  draftId: string,
  currentUserId: string | null,
  lastStep: DraftStep,
): Promise<boolean> {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    select: { userId: true, deletedAt: true, updatedAt: true, lastStep: true },
  });

  if (!draft) return false;
  if (draft.deletedAt) return false;

  assertDraftOwner(draftId, draft.userId, currentUserId);

  // 정책: 새 단계가 기존 last_step보다 뒤일 때만 갱신한다.
  if (!isLaterDraftStep(lastStep, draft.lastStep)) return true;

  // 단계를 옮기는 건 시안 수정이 아니므로, 내 영상의 마지막 수정일(updatedAt)은 그대로 둔다.
  await prisma.draft.update({
    where: { id: draftId },
    data: { lastStep, updatedAt: draft.updatedAt },
  });

  return true;
}
