"use client";

import { useRouter } from "next/navigation";

import { useCurrentUserId } from "@/features/auth/hooks/useCurrentUserId";
import { useDraftAcknowledged } from "@/features/draft/components/DraftAcknowledgedProvider";
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
    router.push(`/draft/${draft.templateId}/photos`);
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
