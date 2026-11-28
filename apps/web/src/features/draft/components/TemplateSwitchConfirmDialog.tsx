"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  nextTemplateName: string | null;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// 목록을 둘러보다 실수로 템플릿을 바꾸지 않도록, 바꾸기 전에 한 번 확인받는다.
export function TemplateSwitchConfirmDialog({
  nextTemplateName,
  isPending,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog
      open={nextTemplateName !== null}
      onOpenChange={(open) => {
        if (!open && !isPending) onCancel();
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            &apos;{nextTemplateName}&apos;(으)로 바꿀까요?
          </DialogTitle>
          <DialogDescription>
            지금까지 입력한 내용은 저장되니 걱정하지 마세요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            취소
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending && (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            )}
            바꾸기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
