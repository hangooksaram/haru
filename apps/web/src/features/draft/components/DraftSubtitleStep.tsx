"use client";

import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import { DraftStepBar } from "@/components/DraftStepBar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DraftEditorBody,
  DraftEditorHeader,
} from "@/features/draft/components/DraftEditorShell";
import {
  DraftPreviewBinding,
  useDraftPreviewContext,
} from "@/features/draft/components/DraftPreviewProvider";
import { DraftSaveStatus } from "@/features/draft/components/DraftSaveStatus";
import { useDraftTexts } from "@/features/draft/hooks/useDraftTexts";
import { useRequireBasicInfo } from "@/features/draft/hooks/useRequireBasicInfo";
import { elementKey } from "@/features/draft/lib/elementKey";
import { trimBlankText } from "@/features/draft/lib/trimBlankText";
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
  const router = useRouter();
  const { data: template } = useTemplate(templateId);
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
  const { activeElementName, selectElement } = useDraftPreviewContext();

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

  const subtitleElements = elements.filter(
    (element) => element.type === "자막",
  );

  async function handlePrimaryClick() {
    if (await saveBeforeNext()) router.push(`/draft/${templateId}/payment`);
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
          primaryLabel="다음: 결제"
          onPrimaryClick={handlePrimaryClick}
          primaryPending={isSubmitting}
        />
      </DraftEditorHeader>

      <DraftEditorBody className="gap-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            {filledCount}/{subtitleElements.length} 채움
          </p>
          <DraftSaveStatus status={saveStatus} />
        </div>

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
      </DraftEditorBody>

      <DraftPreviewBinding segments={segments} texts={previewTexts} />
    </>
  );
}
