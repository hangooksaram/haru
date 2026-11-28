"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { DraftStepBar } from "@/components/DraftStepBar";
import { DraftStepTitle } from "@/components/DraftStepTitle";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DraftEditorBody,
  DraftEditorHeader,
} from "@/features/draft/components/DraftEditorShell";
import { DraftPreviewBinding } from "@/features/draft/components/DraftPreviewProvider";
import { DraftSaveStatus } from "@/features/draft/components/DraftSaveStatus";
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
    saveStatus,
    getValue,
    changeValue,
    saveBeforeNext,
  } = useDraftTexts(templateId);
  const fieldNodesRef = useRef(new Map<string, HTMLElement>());
  // 처음 들어왔을 때부터 빈 칸마다 에러를 띄우지 않도록, 건드리고 벗어난 칸이나 다음을 누른 뒤에만 보여준다.
  const [touchedKeys, setTouchedKeys] = useState<Set<string>>(new Set());
  const [hasTriedNext, setHasTriedNext] = useState(false);

  if (isLoading) {
    return (
      <DraftEditorBody className="gap-4">
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-9 rounded-md" />
        ))}
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
      setHasTriedNext(true);
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

  return (
    <>
      <DraftEditorHeader>
        <DraftStepBar
          current={0}
          templateId={templateId}
          templateName={template?.name ?? ""}
          primaryLabel={
            returnToPayment ? "결제로 돌아가기" : "다음: 사진 올리기"
          }
          onPrimaryClick={handlePrimaryClick}
          primaryPending={isSubmitting}
          saveStatus={<DraftSaveStatus status={saveStatus} />}
        />
      </DraftEditorHeader>

      <DraftEditorBody className="max-w-xl">
        <DraftStepTitle
          sticky
          title="기본정보"
          description="입력한 정보가 영상 속 문구로 들어가요"
          progress={{
            filled: basicInfoElements.length - missingCount,
            total: basicInfoElements.length,
          }}
        />
        <section className="mt-8 flex flex-col gap-4">
          {basicInfoElements.map((element) => (
            <label
              key={elementKey(element)}
              ref={(node) => {
                if (node) fieldNodesRef.current.set(elementKey(element), node);
                else fieldNodesRef.current.delete(elementKey(element));
              }}
              className="flex flex-col gap-1.5 text-base font-medium"
            >
              {removeHyphens(element.name)}
              <Input
                value={getValue(element)}
                placeholder={element.text}
                onChange={(event) =>
                  changeValue(elementKey(element), event.target.value)
                }
                onBlur={() =>
                  setTouchedKeys((prev) =>
                    new Set(prev).add(elementKey(element)),
                  )
                }
              />
              {isEmpty(element) &&
                (hasTriedNext || touchedKeys.has(elementKey(element))) && (
                  <p className="text-destructive text-sm font-normal">
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
