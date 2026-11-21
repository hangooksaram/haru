"use client";

import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DraftStepNav } from "@/components/DraftStepNav";
import { Input } from "@/components/ui/input";
import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { DraftPreviewPanel } from "@/features/draft/components/DraftPreviewPanel";
import { useCreateDraft } from "@/features/draft/hooks/useCreateDraft";
import { useDraft } from "@/features/draft/hooks/useDraft";
import { useDraftPreview } from "@/features/draft/hooks/useDraftPreview";
import { useUpdateDraftTexts } from "@/features/draft/hooks/useUpdateDraftTexts";
import { elementKey } from "@/features/draft/lib/elementKey";
import { removeHyphens } from "@/features/draft/lib/removeHyphens";
import { removeLineBreaks } from "@/features/draft/lib/removeLineBreaks";
import { trimBlankText } from "@/features/draft/lib/trimBlankText";
import { useTemplateTextElements } from "@/features/template/hooks/useTemplateTextElements";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { cn } from "@/lib/utils";

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
      className="w-fit shrink-0 cursor-pointer text-left whitespace-nowrap hover:underline"
    >
      {label}
    </span>
  );
}

// 입력 폼에 미리보기가 보여주는 요소를 표시한다.
function PreviewingBadge() {
  return (
    <span className="bg-foreground text-background flex w-fit shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
      <Eye className="h-3 w-3" />
      미리보기 중
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
  // 미리보기에는 입력을 마친(디바운스 저장된) 값만 반영한다. 매 타이핑마다 반영하지 않는다.
  const [committedTexts, setCommittedTexts] = useState<Record<string, string>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
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
    const restored = Object.fromEntries(
      draft.texts.map(({ name, text }) => [name, removeLineBreaks(text)]),
    );
    setValues(restored);
    setCommittedTexts(restored);
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
      setCommittedTexts(nextValues);
    },
    AUTOSAVE_DEBOUNCE_MS,
  );

  const {
    containerRef: previewContainerRef,
    isLoading: isPreviewLoading,
    isBuffering: isPreviewBuffering,
    error: previewError,
    activeElementName,
    selectElement,
    replay,
    isPlayingAll,
    toggleAll,
    playbackProgress,
  } = useDraftPreview({
    templateId,
    photos: draft?.photos ?? EMPTY_PHOTOS,
    texts: (elements ?? EMPTY_TEXT_ELEMENTS).map((element) => ({
      name: element.name,
      text: committedTexts[elementKey(element)] ?? "",
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
  const filledCount = textElements.filter(
    (element) => trimBlankText(getValue(element)) !== "",
  ).length;
  const segments = textElements.map((element) => ({
    name: element.name,
    filled: trimBlankText(getValue(element)) !== "",
  }));

  return (
    <div className="flex flex-col gap-8">
      <DraftStepNav
        prevHref={prevHref}
        nextHref={nextHref}
        onNext={handleNext}
      />
      {error && <p className="text-destructive text-sm font-medium">{error}</p>}

      <div
        className={cn(
          "grid gap-6 md:items-start",
          isPreviewCollapsed
            ? "md:grid-cols-1"
            : "md:grid-cols-[4.5fr_5.5fr]",
        )}
      >
        <div className="flex flex-col gap-8">
          <p className="text-muted-foreground text-sm">
            {filledCount}/{textElements.length} 채움
          </p>

          {basicInfoElements.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="font-medium">기본정보</h2>
              {basicInfoElements.map((element) => (
                <label
                  key={elementKey(element)}
                  className="flex flex-col gap-1.5 text-sm font-medium"
                >
                  <div className="flex items-start gap-3">
                    <ElementLabelButton
                      label={removeHyphens(element.name)}
                      onSelect={() => selectElement(element.name)}
                    />
                    <Input
                      className="flex-1"
                      value={getValue(element)}
                      placeholder={element.text}
                      onChange={(event) =>
                        handleChange(elementKey(element), event.target.value)
                      }
                    />
                    {element.name === activeElementName && (
                      <PreviewingBadge />
                    )}
                  </div>
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
                  className="flex items-start gap-3 text-sm font-medium"
                >
                  <ElementLabelButton
                    label={removeHyphens(element.name)}
                    onSelect={() => selectElement(element.name)}
                  />
                  <Input
                    className="flex-1"
                    value={getValue(element)}
                    placeholder={element.text}
                    onChange={(event) =>
                      handleChange(elementKey(element), event.target.value)
                    }
                  />
                  {element.name === activeElementName && <PreviewingBadge />}
                </label>
              ))}
            </section>
          )}
        </div>

        <div className="hidden md:block">
          <div className="md:sticky md:top-20">
            <DraftPreviewPanel
              containerRef={previewContainerRef}
              isLoading={isPreviewLoading}
              isBuffering={isPreviewBuffering}
              error={previewError}
              activeElementName={activeElementName}
              segments={segments}
              onReplay={replay}
              isPlayingAll={isPlayingAll}
              onToggleAll={toggleAll}
              playbackProgress={playbackProgress}
              onCollapsedChange={setIsPreviewCollapsed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
