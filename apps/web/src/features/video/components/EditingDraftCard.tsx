"use client";

import { useRouter } from "next/navigation";

import { useCurrentUserId } from "@/features/auth/hooks/useCurrentUserId";
import { useDraftAcknowledged } from "@/features/draft/components/DraftAcknowledgedProvider";
import { DRAFT_STEP_SEGMENTS } from "@/features/draft/constants";
import {
  readStoredDraftId,
  writeStoredDraftId,
} from "@/features/draft/hooks/useStoredDraftId";
import { formatVideoDate } from "@/features/video/lib/formatVideoDate";

import { VideoThumbnail } from "./VideoThumbnail";

import type { EditingDraftVideo } from "@/features/video/types";

type Props = {
  draft: EditingDraftVideo;
};

export function EditingDraftCard({ draft }: Props) {
  const router = useRouter();
  const userId = useCurrentUserId();
  const { acknowledge } = useDraftAcknowledged();

  function handleClick() {
    if (userId === undefined) return;

    if (readStoredDraftId(draft.templateId, userId) !== draft.id) {
      writeStoredDraftId(draft.templateId, userId, draft.id);
    }
    acknowledge(draft.id);
    // 정책: 작성 중 영상 카드를 누르면 그 시안의 last_step(필수 항목이 빈 단계가 있으면 그 첫 단계)으로 이동한다.
    router.push(
      `/draft/${draft.templateId}/${DRAFT_STEP_SEGMENTS[draft.resumeStep]}`,
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex flex-col gap-2.5 text-left"
    >
      <VideoThumbnail templateId={draft.templateId} />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold">{draft.templateName}</span>
        <span className="text-muted-foreground text-xs">
          {formatVideoDate(draft.updatedAt)}
        </span>
      </div>
    </button>
  );
}
