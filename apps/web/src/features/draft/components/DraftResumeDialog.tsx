"use client";

import { useEffect } from "react";

import { usePathname, useSearchParams } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";

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

export function DraftResumeDialog() {
  const { draftId, clearDraftId, isFreshlyCreated, acknowledgeResume } =
    useDraftId();
  const { data: draft } = useDraft(draftId ?? null);
  const { mutate: deleteDraft, isPending, error } = useDeleteDraft();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 결제 단계는 이미 끝까지 작성한 시안으로 들어온 화면이라 "이어서 작성/새로
  // 시작"을 물을 이유가 없고, 새로 시작을 잘못 누르면 결제 직전에 시안이
  // 삭제되는 위험도 있다.
  const isPaymentStep = pathname.includes("/payment");

  // 정책: 결제 페이지에서 수정하려고 진입한 경우 이어하기 모달을 노출하지 않는다.
  const isReturnFromPayment = searchParams.get("return") === "payment";

  // 수정 중 다른 스텝으로 이동해 쿼리가 사라져도 모달이 뜨지 않도록 확인 처리한다.
  useEffect(() => {
    if (isReturnFromPayment && draftId && !isFreshlyCreated) {
      acknowledgeResume();
    }
  }, [isReturnFromPayment, draftId, isFreshlyCreated, acknowledgeResume]);

  // 정책: 기본정보(필수)가 비어 있는 시안은 이어갈 작성 내용이 없으므로 모달 없이 그대로 사용한다.
  const hasText = draft?.texts.some(({ text }) => text.trim() !== "") ?? false;

  const open =
    Boolean(draftId && draft) &&
    hasText &&
    !isFreshlyCreated &&
    !isPaymentStep &&
    !isReturnFromPayment;

  function handleResume() {
    acknowledgeResume();
  }

  function handleRestart() {
    if (!draftId) return;
    deleteDraft(draftId, {
      onSuccess: () => {
        queryClient.removeQueries({ queryKey: ["draft", draftId] });
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
