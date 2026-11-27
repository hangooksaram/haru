"use client";

import Link from "next/link";
import { useState } from "react";

import { DraftStepBar } from "@/components/DraftStepBar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { DraftVideoPreview } from "@/features/draft/components/DraftVideoPreview";
import { useDraft } from "@/features/draft/hooks/useDraft";
import { OrderPaymentSummary } from "@/features/order/components/OrderPaymentSummary";
import { useTemplate } from "@/features/template/hooks/useTemplate";

import { PaymentWidget } from "./PaymentWidget";

type Props = {
  templateId: string;
  orderId: string;
};

type EditItem = {
  label: string;
  href: string;
};

export function PaymentStep({ templateId, orderId }: Props) {
  const { draftId } = useDraftId();
  const { data: draft } = useDraft(draftId ?? null);
  const { data: template } = useTemplate(templateId);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const editItems: EditItem[] = [
    { label: "템플릿", href: "/templates" },
    {
      label: "기본정보",
      href: `/draft/${templateId}/basic-info?return=payment`,
    },
    { label: "사진", href: `/draft/${templateId}/photos?return=payment` },
    { label: "자막", href: `/draft/${templateId}/subtitle` },
  ];

  return (
    <div className="flex flex-col gap-4 py-4">
      <DraftStepBar
        current={3}
        templateId={templateId}
        templateName={template?.name ?? ""}
        prevHref={`/draft/${templateId}/subtitle`}
        primaryLabel="결제하기"
        onPrimaryClick={() => setIsPaymentOpen(true)}
      />

      <OrderPaymentSummary orderId={orderId} />

      {draft ? (
        <div className="w-1/2">
          <DraftVideoPreview
            templateId={templateId}
            photos={draft.photos}
            texts={draft.texts}
          />
        </div>
      ) : (
        <p className="text-muted-foreground">불러오는 중...</p>
      )}

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg">
              수정하기
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {editItems.map((item) => (
              <DropdownMenuItem key={item.label} asChild>
                <Link href={item.href}>{item.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>결제</DialogTitle>
          </DialogHeader>
          <PaymentWidget orderId={orderId} templateId={templateId} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
