"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { useDeleteDraft } from "@/features/draft/hooks/useDeleteDraft";
import { useDraft } from "@/features/draft/hooks/useDraft";
import { useStoredDraftTexts } from "@/features/draft/hooks/useStoredDraftTexts";

export function DraftResumeDialog() {
  const { draftId, clearDraftId, isFreshlyCreated } = useDraftId();
  const { data: draft } = useDraft(draftId ?? null);
  const { clear: clearTexts } = useStoredDraftTexts(draftId ?? null);
  const { mutate: deleteDraft, isPending, error } = useDeleteDraft();
  const queryClient = useQueryClient();
  const [acknowledged, setAcknowledged] = useState(false);

  const open = Boolean(draftId && draft) && !isFreshlyCreated && !acknowledged;

  function handleResume() {
    setAcknowledged(true);
  }

  function handleRestart() {
    if (!draftId) return;
    deleteDraft(draftId, {
      onSuccess: () => {
        queryClient.removeQueries({ queryKey: ["draft", draftId] });
        clearTexts();
        clearDraftId();
      },
    });
  }

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>작성 중이던 시안이 있어요</DialogTitle>
          <DialogDescription>이어서 작성하시겠어요?</DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-destructive text-sm font-medium">
            시안을 삭제하지 못했습니다. 다시 시도해 주세요.
          </p>
        )}
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleRestart}
            disabled={isPending}
          >
            새로 시작
          </Button>
          <Button onClick={handleResume} disabled={isPending}>
            이어서 작성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
