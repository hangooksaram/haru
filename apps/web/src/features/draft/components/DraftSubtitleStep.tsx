"use client";

import { Eye } from "lucide-react";

import { DraftStepBar } from "@/components/DraftStepBar";
import { Input } from "@/components/ui/input";
import {
  DraftEditorBody,
  DraftEditorHeader,
} from "@/features/draft/components/DraftEditorShell";
import {
  DraftPreviewBinding,
  useDraftPreviewContext,
} from "@/features/draft/components/DraftPreviewProvider";
import { useDraftTexts } from "@/features/draft/hooks/useDraftTexts";
import { useRequireBasicInfo } from "@/features/draft/hooks/useRequireBasicInfo";
import { elementKey } from "@/features/draft/lib/elementKey";
import { trimBlankText } from "@/features/draft/lib/trimBlankText";
import { useCreateOrderWithGuestResume } from "@/features/order/hooks/useCreateOrderWithGuestResume";
import { useTemplate } from "@/features/template/hooks/useTemplate";

type Props = {
  templateId: string;
  prevHref: string;
};

// 입력 폼에 미리보기가 보여주는 요소를 표시한다.
function PreviewingBadge() {
  return (
    <span className="bg-foreground text-background flex w-fit shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
      <Eye className="h-3 w-3" />
      미리보기 중
    </span>
  );
}

export function DraftSubtitleStep({ templateId, prevHref }: Props) {
  useRequireBasicInfo(templateId);
  const {
    handleOrderClick,
    message: orderMessage,
    isPending: isOrderPending,
  } = useCreateOrderWithGuestResume(templateId, `/draft/${templateId}/subtitle`);
  const { data: template } = useTemplate(templateId);
  const {
    isLoading,
    elements,
    previewTexts,
    isSubmitting,
    getValue,
    changeValue,
    saveBeforeNext,
  } = useDraftTexts(templateId);
  const { activeElementName, selectElement } = useDraftPreviewContext();

  if (isLoading) {
    return (
      <DraftEditorBody>
        <p className="text-muted-foreground">불러오는 중...</p>
      </DraftEditorBody>
    );
  }

  const subtitleElements = elements.filter(
    (element) => element.type === "자막",
  );

  async function handlePrimaryClick() {
    if (await saveBeforeNext()) await handleOrderClick();
  }

  const filledCount = subtitleElements.filter(
    (element) => trimBlankText(getValue(element)) !== "",
  ).length;
  const segments = elements.map((element) => ({
    name: elementKey(element),
    filled: trimBlankText(getValue(element)) !== "",
  }));

  return (
    <>
      <DraftEditorHeader>
        <DraftStepBar
          current={2}
          templateId={templateId}
          templateName={template?.name ?? ""}
          prevHref={prevHref}
          primaryLabel="이 시안으로 주문"
          onPrimaryClick={handlePrimaryClick}
          primaryPending={isSubmitting || isOrderPending}
        />
      </DraftEditorHeader>

      <DraftEditorBody className="gap-8">
        <p className="text-muted-foreground text-sm">
          {filledCount}/{subtitleElements.length} 채움
        </p>

        <section className="flex flex-col gap-4">
          <h2 className="font-medium">자막</h2>
          {subtitleElements.map((element) => (
            <label
              key={elementKey(element)}
              className="flex flex-col gap-1.5 text-sm font-medium"
            >
              <div className="flex items-start gap-3">
                <Input
                  className="flex-1"
                  value={getValue(element)}
                  placeholder={element.text}
                  onChange={(event) =>
                    changeValue(elementKey(element), event.target.value)
                  }
                  onFocus={() => selectElement(elementKey(element))}
                />
                {elementKey(element) === activeElementName && (
                  <PreviewingBadge />
                )}
              </div>
            </label>
          ))}
        </section>

        {orderMessage && (
          <p className="text-sm font-medium text-amber-600">{orderMessage}</p>
        )}
      </DraftEditorBody>

      <DraftPreviewBinding segments={segments} texts={previewTexts} />
    </>
  );
}
