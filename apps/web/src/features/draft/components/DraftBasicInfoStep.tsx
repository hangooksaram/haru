"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";

import { DraftStepBar } from "@/components/DraftStepBar";
import { Input } from "@/components/ui/input";
import {
  DraftEditorBody,
  DraftEditorHeader,
} from "@/features/draft/components/DraftEditorShell";
import { DraftPreviewBinding } from "@/features/draft/components/DraftPreviewProvider";
import { useDraftTexts } from "@/features/draft/hooks/useDraftTexts";
import { useCreateDraftOnEntry } from "@/features/draft/hooks/useCreateDraftOnEntry";
import { elementKey } from "@/features/draft/lib/elementKey";
import { removeHyphens } from "@/features/draft/lib/removeHyphens";
import { trimBlankText } from "@/features/draft/lib/trimBlankText";
import { useTemplate } from "@/features/template/hooks/useTemplate";

import type { DraftPreviewSegment } from "@/features/draft/components/DraftPreviewPanel";
import type { TemplateTextElement } from "@/features/template/types";

// 기본정보 스텝은 미리보기를 보여주지 않으므로 요소 목록을 넘기지 않는다.
const EMPTY_SEGMENTS: DraftPreviewSegment[] = [];

type Props = {
  templateId: string;
  nextHref: string;
  returnToPayment?: boolean;
};

export function DraftBasicInfoStep({
  templateId,
  nextHref,
  returnToPayment,
}: Props) {
  const router = useRouter();
  const { data: template } = useTemplate(templateId);
  useCreateDraftOnEntry(templateId);
  const {
    isLoading,
    elements,
    previewTexts,
    isSubmitting,
    getValue,
    changeValue,
    saveBeforeNext,
  } = useDraftTexts(templateId);
  const fieldNodesRef = useRef(new Map<string, HTMLElement>());

  if (isLoading) {
    return (
      <DraftEditorBody>
        <p className="text-muted-foreground">불러오는 중...</p>
      </DraftEditorBody>
    );
  }

  const basicInfoElements = elements.filter(
    (element) => element.type === "기본정보",
  );

  function isEmpty(element: TemplateTextElement): boolean {
    return trimBlankText(getValue(element)) === "";
  }

  async function handlePrimaryClick() {
    const firstEmpty = basicInfoElements.find(isEmpty);

    if (firstEmpty) {
      toast.error("기본정보를 모두 입력해 주세요.");

      const node = fieldNodesRef.current.get(elementKey(firstEmpty));
      if (node) {
        node.scrollIntoView?.({ behavior: "smooth", block: "center" });
        node.classList.add("ring-2", "ring-destructive", "ring-offset-2");
        setTimeout(() => {
          node.classList.remove("ring-2", "ring-destructive", "ring-offset-2");
        }, 1600);
      }

      return;
    }

    if (!(await saveBeforeNext())) return;

    router.push(returnToPayment ? `/draft/${templateId}/payment` : nextHref);
  }

  const missingCount = basicInfoElements.filter(isEmpty).length;
  const filledCount = basicInfoElements.length - missingCount;

  return (
    <>
      <DraftEditorHeader>
        <DraftStepBar
          current={0}
          templateId={templateId}
          templateName={template?.name ?? ""}
          primaryLabel={returnToPayment ? "결제로 돌아가기" : "다음: 사진"}
          onPrimaryClick={handlePrimaryClick}
          primaryPending={isSubmitting}
          remainingLabel={
            missingCount > 0 ? `기본정보 ${missingCount}개 남음` : undefined
          }
        />
      </DraftEditorHeader>

      <DraftEditorBody className="gap-8">
        <p className="text-muted-foreground text-sm">
          {filledCount}/{basicInfoElements.length} 채움
        </p>

        <section className="flex flex-col gap-4">
          <h2 className="font-medium">기본정보</h2>
          {basicInfoElements.map((element) => (
            <label
              key={elementKey(element)}
              ref={(node) => {
                if (node) fieldNodesRef.current.set(elementKey(element), node);
                else fieldNodesRef.current.delete(elementKey(element));
              }}
              className="flex flex-col gap-1.5 text-sm font-medium"
            >
              <div className="flex items-start gap-3">
                <span className="w-fit shrink-0 whitespace-nowrap">
                  {removeHyphens(element.name)}
                </span>
                <Input
                  className="flex-1"
                  value={getValue(element)}
                  placeholder={element.text}
                  onChange={(event) =>
                    changeValue(elementKey(element), event.target.value)
                  }
                />
              </div>
              {isEmpty(element) && (
                <p className="text-destructive text-xs font-normal">
                  필수 입력입니다.
                </p>
              )}
            </label>
          ))}
        </section>
      </DraftEditorBody>

      <DraftPreviewBinding segments={EMPTY_SEGMENTS} texts={previewTexts} />
    </>
  );
}
