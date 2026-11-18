"use client";

import { useEffect, useRef, useState } from "react";

import { DraftStepNav } from "@/components/DraftStepNav";
import { Input } from "@/components/ui/input";
import { DraftElementPreviewPanel } from "@/features/draft/components/DraftElementPreviewPanel";
import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { useCreateDraft } from "@/features/draft/hooks/useCreateDraft";
import { useDraft } from "@/features/draft/hooks/useDraft";
import { useDraftElementPreviewPanel } from "@/features/draft/hooks/useDraftElementPreviewPanel";
import { useUpdateDraftTexts } from "@/features/draft/hooks/useUpdateDraftTexts";
import { elementKey } from "@/features/draft/lib/elementKey";
import { removeHyphens } from "@/features/draft/lib/removeHyphens";
import { removeLineBreaks } from "@/features/draft/lib/removeLineBreaks";
import { trimBlankText } from "@/features/draft/lib/trimBlankText";
import { useTemplateTextElements } from "@/features/template/hooks/useTemplateTextElements";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

import type { DraftPhoto, DraftTextInput } from "@/features/draft/types";
import type { TemplateTextElement } from "@/features/template/types";

const AUTOSAVE_DEBOUNCE_MS = 500;
const EMPTY_PHOTOS: DraftPhoto[] = [];
const EMPTY_TEXT_ELEMENTS: TemplateTextElement[] = [];

type Props = {
  templateId: string;
  prevHref: string;
  nextHref: string;
};

type ElementLabelButtonProps = {
  label: string;
  onSelect: () => void;
};

// <label>에 <button> 등 labelable 요소를 중첩하면 Input의 접근성 이름 계산이 깨지므로
// role="button"을 쓴 <span>으로 구현한다.
function ElementLabelButton({ label, onSelect }: ElementLabelButtonProps) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onSelect();
      }}
      className="w-fit cursor-pointer text-left hover:underline"
    >
      {label}
    </span>
  );
}

export function DraftTextStep({ templateId, prevHref, nextHref }: Props) {
  const { draftId, setDraftId } = useDraftId();
  const { mutate: createDraft } = useCreateDraft();
  const { data: elements, isLoading: isElementsLoading } =
    useTemplateTextElements(templateId);
  const { data: draft, isLoading: isDraftLoading } = useDraft(draftId ?? null);
  const { mutate: updateTexts } = useUpdateDraftTexts(draftId ?? "");
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const hydratedDraftId = useRef<string | null>(null);

  useEffect(() => {
    if (draftId === undefined || draftId) return;
    createDraft(templateId, {
      onSuccess: (created) => setDraftId(created.id),
    });
  }, [draftId, templateId, createDraft, setDraftId]);

  useEffect(() => {
    if (!draftId || !draft || hydratedDraftId.current === draftId) return;
    hydratedDraftId.current = draftId;
    // 템플릿의 텍스트 요소가 바뀌었을 수 있으므로 복원한 값도 입력 검증을 거친다.
    setValues(
      Object.fromEntries(
        draft.texts.map(({ name, text }) => [name, removeLineBreaks(text)]),
      ),
    );
  }, [draftId, draft]);

  const saveTexts = useDebouncedCallback(
    (
      textElements: TemplateTextElement[],
      nextValues: Record<string, string>,
    ) => {
      const payload: DraftTextInput[] = textElements.flatMap((element) => {
        const text = nextValues[elementKey(element)] ?? "";
        if (element.type === "기본정보" && trimBlankText(text) === "") {
          return [];
        }
        return [{ type: element.type, name: element.name, text }];
      });
      updateTexts(payload);
    },
    AUTOSAVE_DEBOUNCE_MS,
  );

  const {
    isOpen: isPreviewOpen,
    toggle: togglePreview,
    containerRef: previewContainerRef,
    isLoading: isPreviewLoading,
    isBuffering: isPreviewBuffering,
    error: previewError,
    onSelect: handleSelectElement,
  } = useDraftElementPreviewPanel({
    templateId,
    photos: draft?.photos ?? EMPTY_PHOTOS,
    texts: (elements ?? EMPTY_TEXT_ELEMENTS).map((element) => ({
      name: element.name,
      text: values[elementKey(element)] ?? "",
    })),
  });

  if (!draftId || isElementsLoading || isDraftLoading || !elements) {
    return <p className="text-muted-foreground">불러오는 중...</p>;
  }

  const textElements = elements;

  function handleChange(key: string, raw: string) {
    const value = removeLineBreaks(raw);
    const next = { ...values, [key]: value };
    setValues(next);
    saveTexts(textElements, next);
  }

  function getValue(element: TemplateTextElement): string {
    return values[elementKey(element)] ?? "";
  }

  function isBasicInfoEmpty(element: TemplateTextElement): boolean {
    return (
      element.type === "기본정보" && trimBlankText(getValue(element)) === ""
    );
  }

  async function handleNext(): Promise<boolean> {
    setError(null);

    const hasEmptyBasicInfo = textElements.some(isBasicInfoEmpty);

    if (hasEmptyBasicInfo) {
      setError("기본정보를 모두 입력해 주세요.");

      return false;
    }

    return true;
  }

  const basicInfoElements = textElements.filter(
    (element) => element.type === "기본정보",
  );
  const subtitleElements = textElements.filter(
    (element) => element.type === "자막",
  );

  return (
    <div className="flex flex-col gap-8">
      <DraftStepNav
        prevHref={prevHref}
        nextHref={nextHref}
        onNext={handleNext}
      />
      {error && <p className="text-destructive text-sm font-medium">{error}</p>}

      {basicInfoElements.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-medium">기본정보</h2>
          {basicInfoElements.map((element) => (
            <label
              key={elementKey(element)}
              className="flex flex-col gap-1.5 text-sm font-medium"
            >
              <ElementLabelButton
                label={removeHyphens(element.name)}
                onSelect={() => handleSelectElement(element.name)}
              />
              <Input
                value={getValue(element)}
                placeholder={element.text}
                onChange={(event) =>
                  handleChange(elementKey(element), event.target.value)
                }
              />
              {isBasicInfoEmpty(element) && (
                <p className="text-destructive text-xs font-normal">
                  필수 입력입니다.
                </p>
              )}
            </label>
          ))}
        </section>
      )}

      {subtitleElements.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-medium">자막</h2>
          {subtitleElements.map((element) => (
            <label
              key={elementKey(element)}
              className="flex flex-col gap-1.5 text-sm font-medium"
            >
              <ElementLabelButton
                label={removeHyphens(element.name)}
                onSelect={() => handleSelectElement(element.name)}
              />
              <Input
                value={getValue(element)}
                placeholder={element.text}
                onChange={(event) =>
                  handleChange(elementKey(element), event.target.value)
                }
              />
            </label>
          ))}
        </section>
      )}

      <DraftElementPreviewPanel
        isOpen={isPreviewOpen}
        onToggle={togglePreview}
        containerRef={previewContainerRef}
        isLoading={isPreviewLoading}
        isBuffering={isPreviewBuffering}
        error={previewError}
      />
    </div>
  );
}
