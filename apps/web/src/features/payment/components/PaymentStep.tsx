"use client";

import { useState } from "react";

import { DraftStepBar } from "@/components/DraftStepBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsAnonymousUser } from "@/features/auth/hooks/useIsAnonymousUser";
import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { DraftVideoPreview } from "@/features/draft/components/DraftVideoPreview";
import { useDraft } from "@/features/draft/hooks/useDraft";
import { elementKey } from "@/features/draft/lib/elementKey";
import { trimBlankText } from "@/features/draft/lib/trimBlankText";
import { useCreateOrderWithGuestResume } from "@/features/order/hooks/useCreateOrderWithGuestResume";
import { useTemplate } from "@/features/template/hooks/useTemplate";
import { useTemplateTextElements } from "@/features/template/hooks/useTemplateTextElements";
import { useVideoRequestValidation } from "@/features/video/hooks/useVideoRequestValidation";

import { PaymentSummaryCard } from "./PaymentSummaryCard";
import { PaymentWidget } from "./PaymentWidget";

import type { PaymentSummaryItem } from "./PaymentSummaryCard";
import type { Draft } from "@/features/draft/types";
import type { TemplateTextElement } from "@/features/template/types";

type Props = {
  templateId: string;
};

type PreviewProps = {
  templateId: string;
  draft: Draft | undefined;
  isValidating: boolean;
};

function PaymentPreview({ templateId, draft, isValidating }: PreviewProps) {
  if (isValidating || !draft) {
    return <Skeleton className="aspect-video w-full rounded-xl" />;
  }

  return (
    <DraftVideoPreview
      templateId={templateId}
      photos={draft.photos}
      texts={draft.texts}
    />
  );
}

function buildSummaryItems(
  templateId: string,
  templateName: string,
  draft: Draft | undefined,
  textElements: TemplateTextElement[],
): PaymentSummaryItem[] {
  const textByKey = new Map(
    (draft?.texts ?? []).map(({ name, text }) => [name, trimBlankText(text)]),
  );
  const filledTexts = (type: TemplateTextElement["type"]) =>
    textElements
      .filter((element) => element.type === type)
      .map((element) => textByKey.get(elementKey(element)) ?? "")
      .filter((text) => text !== "");

  return [
    {
      label: "템플릿",
      value: templateName,
      href: "/templates",
      actionLabel: "변경",
      note: "다른 템플릿을 고르면 새로 작성해요. 지금 내용은 저장돼 있어요.",
    },
    {
      label: "기본정보",
      value: filledTexts("기본정보").join(" · "),
      href: `/draft/${templateId}/basic-info?return=payment`,
      actionLabel: "수정",
    },
    {
      label: "사진",
      value: draft ? `${draft.photos.length}장` : "",
      href: `/draft/${templateId}/photos?return=payment`,
      actionLabel: "수정",
    },
    {
      label: "자막",
      value: `${filledTexts("자막").length}개 입력`,
      href: `/draft/${templateId}/subtitle`,
      actionLabel: "수정",
    },
  ];
}

export function PaymentStep({ templateId }: Props) {
  const { draftId } = useDraftId();
  const { data: draft } = useDraft(draftId ?? null);
  const { data: template } = useTemplate(templateId);
  const { data: textElements } = useTemplateTextElements(templateId);
  const isAnonymous = useIsAnonymousUser();
  const [orderId, setOrderId] = useState<string | null>(null);
  const validation = useVideoRequestValidation(draftId ?? null);
  const { handleOrderClick, message, isPending } =
    useCreateOrderWithGuestResume(
      templateId,
      `/draft/${templateId}/payment`,
      setOrderId,
    );

  const templateName = template?.name ?? "";
  const price = template?.price;
  const validationErrors =
    validation.data?.passed === false ? validation.data.errors : null;

  return (
    <div className="flex flex-col gap-4 py-4">
      <DraftStepBar
        current={3}
        templateId={templateId}
        templateName={templateName}
        prevHref={`/draft/${templateId}/subtitle`}
      />

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,5.5fr)_minmax(0,4.5fr)]">
        <section aria-label="영상 미리보기" className="min-w-0">
          <PaymentPreview
            templateId={templateId}
            draft={draft}
            isValidating={validation.isPending}
          />
        </section>

        <PaymentSummaryCard
          templateName={templateName}
          price={price}
          items={buildSummaryItems(
            templateId,
            templateName,
            draft,
            textElements ?? [],
          )}
          payLabel={
            price != null
              ? `${price.toLocaleString("ko-KR")}원 결제하기`
              : "결제하기"
          }
          onPayClick={handleOrderClick}
          isPayDisabled={
            isPending || validation.isPending || validationErrors !== null
          }
          isValidating={validation.isPending}
          showLoginNotice={isAnonymous === true}
          message={message}
          validationErrors={validationErrors}
          isValidationError={validation.isError}
        />
      </div>

      <Dialog
        open={orderId !== null}
        onOpenChange={(open) => {
          if (!open) setOrderId(null);
        }}
      >
        {/* 결제 중 실수로 닫히지 않도록 바깥 클릭·Esc로는 닫지 않고 닫기(X) 버튼으로만 닫는다. */}
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>결제</DialogTitle>
          </DialogHeader>
          {orderId && (
            <PaymentWidget orderId={orderId} templateId={templateId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
