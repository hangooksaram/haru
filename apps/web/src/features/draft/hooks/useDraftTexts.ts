"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { useDraft } from "@/features/draft/hooks/useDraft";
import { useUpdateDraftTexts } from "@/features/draft/hooks/useUpdateDraftTexts";
import { elementKey } from "@/features/draft/lib/elementKey";
import { removeLineBreaks } from "@/features/draft/lib/removeLineBreaks";
import { trimBlankText } from "@/features/draft/lib/trimBlankText";
import { useTemplateTextElements } from "@/features/template/hooks/useTemplateTextElements";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

import type { DraftTextInput } from "@/features/draft/types";
import type { TemplateTextElement } from "@/features/template/types";

const AUTOSAVE_DEBOUNCE_MS = 500;
const EMPTY_BASIC_INFO_PREVIEW_TEXT = " ";
const EMPTY_TEXT_ELEMENTS: TemplateTextElement[] = [];

// 기본정보·자막 입력 화면이 함께 쓰는 입력값 관리 훅이다.
// 입력값 상태, 서버에 저장된 값 복원, 자동 저장을 맡는다. 시안은 만들지 않는다.
export function useDraftTexts(templateId: string) {
  const { draftId } = useDraftId();
  const { data: elements, isLoading: isElementsLoading } =
    useTemplateTextElements(templateId);
  const { data: draft, isLoading: isDraftLoading } = useDraft(draftId ?? null);
  const { mutateAsync: updateTexts } = useUpdateDraftTexts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  // 미리보기에는 입력을 마친(디바운스 저장된) 값만 반영한다. 매 타이핑마다 반영하지 않는다.
  const [debouncedValues, setDebouncedValues] = useState<
    Record<string, string>
  >({});
  const hydratedDraftId = useRef<string | null>(null);
  const textElements = elements ?? EMPTY_TEXT_ELEMENTS;

  useEffect(() => {
    if (!draftId || !draft || hydratedDraftId.current === draftId) return;
    hydratedDraftId.current = draftId;
    // 템플릿의 텍스트 요소가 바뀌었을 수 있으므로 복원한 값도 입력 검증을 거친다.
    const restored = Object.fromEntries(
      draft.texts.map(({ name, text }) => [name, removeLineBreaks(text)]),
    );
    setValues(restored);
    setDebouncedValues(restored);
  }, [draftId, draft]);

  async function persistTexts(nextValues: Record<string, string>) {
    const payload: DraftTextInput[] = textElements.flatMap((element) => {
      const text = nextValues[elementKey(element)] ?? "";
      if (element.type === "기본정보" && trimBlankText(text) === "") {
        return [];
      }
      return [{ type: element.type, name: element.name, text }];
    });
    setDebouncedValues(nextValues);

    if (!draftId) return;
    await updateTexts({ draftId, texts: payload });
  }

  const saveTexts = useDebouncedCallback(
    (nextValues: Record<string, string>) => {
      persistTexts(nextValues).catch(() => {});
    },
    AUTOSAVE_DEBOUNCE_MS,
  );

  // 타이핑마다 리렌더되어도 debouncedValues(디바운스된 값)가 그대로면
  // 레퍼런스를 유지해 미리보기 쪽 setModifications가 불필요하게 재호출되지 않게 한다.
  const previewTexts = useMemo(
    () =>
      textElements.map((element) => {
        const text = debouncedValues[elementKey(element)] ?? "";
        const isEmptyBasicInfo =
          element.type === "기본정보" && trimBlankText(text) === "";

        return {
          name: elementKey(element),
          // 빈 값을 보내면 {{placeholder}}가 그대로 노출되므로 임의 값을 보낸다.
          text: isEmptyBasicInfo ? EMPTY_BASIC_INFO_PREVIEW_TEXT : text,
        };
      }),
    [textElements, debouncedValues],
  );

  const isLoading =
    !draftId || isElementsLoading || isDraftLoading || !elements;

  function getValue(element: TemplateTextElement): string {
    return values[elementKey(element)] ?? "";
  }

  function changeValue(key: string, raw: string) {
    const next = { ...values, [key]: removeLineBreaks(raw) };
    setValues(next);
    saveTexts(next);
  }

  // 디바운스 대기 중인 입력도 이동 전에 저장한다.
  // 저장에 성공하면 true를 돌려준다. 성공하면 이동할 때까지 주 버튼을 잠근 채로 둔다.
  async function saveBeforeNext(): Promise<boolean> {
    setIsSubmitting(true);
    try {
      await persistTexts(values);
    } catch {
      toast.error("저장에 실패했습니다. 다시 시도해 주세요.");
      setIsSubmitting(false);
      return false;
    }

    return true;
  }

  return {
    isLoading,
    elements: textElements,
    previewTexts,
    isSubmitting,
    getValue,
    changeValue,
    saveBeforeNext,
  };
}
