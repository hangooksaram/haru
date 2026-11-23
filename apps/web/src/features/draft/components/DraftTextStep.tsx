"use client";

import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { DraftStepBar } from "@/components/DraftStepBar";
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

import type { DraftPhoto, DraftTextInput } from "@/features/draft/types";
import type { TemplateTextElement } from "@/features/template/types";
import type { CSSProperties } from "react";

const AUTOSAVE_DEBOUNCE_MS = 500;
const EMPTY_PHOTOS: DraftPhoto[] = [];
const EMPTY_TEXT_ELEMENTS: TemplateTextElement[] = [];

type Props = {
  textType: TemplateTextElement["type"];
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

export function DraftTextStep({
  textType,
  templateId,
  prevHref,
  nextHref,
}: Props) {
  const router = useRouter();
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
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const hydratedDraftId = useRef<string | null>(null);
  const fieldNodesRef = useRef(new Map<string, HTMLElement>());

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

  // 타이핑마다 리렌더되어도 committedTexts(디바운스된 값)가 그대로면
  // 레퍼런스를 유지해 미리보기 쪽 setModifications가 불필요하게 재호출되지 않게 한다.
  const previewTexts = useMemo(
    () =>
      (elements ?? EMPTY_TEXT_ELEMENTS).map((element) => ({
        name: elementKey(element),
        text: committedTexts[elementKey(element)] ?? "",
      })),
    [elements, committedTexts],
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
    texts: previewTexts,
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

  const stepElements = textElements.filter(
    (element) => element.type === textType,
  );

  function handlePrimaryClick() {
    const firstEmpty = stepElements.find(isBasicInfoEmpty);

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

    router.push(nextHref);
  }

  const missingBasicInfoCount = stepElements.filter(isBasicInfoEmpty).length;
  const filledCount = stepElements.filter(
    (element) => trimBlankText(getValue(element)) !== "",
  ).length;
  const segments = textElements.map((element) => ({
    name: elementKey(element),
    filled: trimBlankText(getValue(element)) !== "",
  }));

  return (
    <div className="flex flex-col gap-4">
      <DraftStepBar
        current={textType === "기본정보" ? 1 : 2}
        templateId={templateId}
        templateName={draft?.templateName ?? ""}
        prevHref={prevHref}
        primaryLabel={
          textType === "기본정보" ? "다음: 자막 입력" : "이 시안으로 주문"
        }
        onPrimaryClick={handlePrimaryClick}
        remainingLabel={
          missingBasicInfoCount > 0
            ? `기본정보 ${missingBasicInfoCount}개 남음`
            : undefined
        }
      />

      <div
        className="grid gap-6 md:[grid-template-columns:var(--preview-cols)] md:transition-[grid-template-columns] md:duration-[380ms] md:ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={
          {
            "--preview-cols": isPreviewCollapsed ? "1fr 0fr" : "4.5fr 5.5fr",
          } as CSSProperties
        }
      >
        <div className="flex flex-col gap-8">
          <p className="text-muted-foreground text-sm">
            {filledCount}/{stepElements.length} 채움
          </p>

          <section className="flex flex-col gap-4">
            <h2 className="font-medium">{textType}</h2>
            {stepElements.map((element) => (
              <label
                key={elementKey(element)}
                ref={(node) => {
                  if (node)
                    fieldNodesRef.current.set(elementKey(element), node);
                  else fieldNodesRef.current.delete(elementKey(element));
                }}
                className="flex flex-col gap-1.5 text-sm font-medium"
              >
                <div className="flex items-start gap-3">
                  <ElementLabelButton
                    label={removeHyphens(element.name)}
                    onSelect={() => selectElement(elementKey(element))}
                  />
                  <Input
                    className="flex-1"
                    value={getValue(element)}
                    placeholder={element.text}
                    onChange={(event) =>
                      handleChange(elementKey(element), event.target.value)
                    }
                    onFocus={() => selectElement(elementKey(element))}
                  />
                  {elementKey(element) === activeElementName && (
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
        </div>

        <div className="hidden min-w-0 md:block">
          <div className="md:sticky md:top-[136px]">
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
