"use client";

import { useEffect, useState } from "react";

import { DraftStepNav } from "@/components/DraftStepNav";
import { Input } from "@/components/ui/input";
import { useCurrentUserId } from "@/features/auth/hooks/useCurrentUserId";
import { useCreateDraft } from "@/features/draft/hooks/useCreateDraft";
import { useStoredDraftId } from "@/features/draft/hooks/useStoredDraftId";
import { useStoredDraftTexts } from "@/features/draft/hooks/useStoredDraftTexts";
import { useUpdateDraftTexts } from "@/features/draft/hooks/useUpdateDraftTexts";
import { removeHyphens } from "@/features/draft/lib/removeHyphens";
import { removeLineBreaks } from "@/features/draft/lib/removeLineBreaks";
import { trimBlankText } from "@/features/draft/lib/trimBlankText";
import { useTemplateTextElements } from "@/features/template/hooks/useTemplateTextElements";

import type { TemplateTextElement } from "@/features/template/types";

type Props = {
  templateId: string;
  prevHref: string;
  nextHref: string;
};

function elementKey(element: TemplateTextElement): string {
  return `${element.type}_${element.name}`;
}

export function DraftTextStep({ templateId, prevHref, nextHref }: Props) {
  const currentUserId = useCurrentUserId();
  const { draftId, setDraftId } = useStoredDraftId(templateId, currentUserId);
  const { mutate: createDraft } = useCreateDraft();
  const { data: elements, isLoading } = useTemplateTextElements(templateId);
  const {
    values: storedValues,
    setValue: setStoredValue,
    clear: clearStoredValues,
  } = useStoredDraftTexts(draftId ?? null);
  const update = useUpdateDraftTexts(draftId ?? "");
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (draftId === undefined || draftId) return;
    createDraft(templateId, {
      onSuccess: (created) => setDraftId(created.id),
    });
  }, [draftId, templateId, createDraft, setDraftId]);

  useEffect(() => {
    setValues(storedValues);
  }, [storedValues]);

  if (!draftId || isLoading || !elements) {
    return <p className="text-muted-foreground">불러오는 중...</p>;
  }

  const textElements = elements;

  function handleChange(key: string, raw: string) {
    const value = removeLineBreaks(raw);
    setValues((prev) => ({ ...prev, [key]: value }));
    setStoredValue(key, value);
  }

  function getValue(element: TemplateTextElement): string {
    return values[elementKey(element)] ?? "";
  }

  function isBasicInfoEmpty(element: TemplateTextElement): boolean {
    return (
      element.type === "기본정보" &&
      trimBlankText(getValue(element)) === ""
    );
  }

  async function handleNext(): Promise<boolean> {
    setError(null);

    const hasEmptyBasicInfo = textElements.some(isBasicInfoEmpty);

    if (hasEmptyBasicInfo) {
      setError("기본정보를 모두 입력해 주세요.");

      return false;
    }

    const texts = textElements.map((element) => ({
      type: element.type,
      name: element.name,
      text: getValue(element),
    }));

    try {
      await update.mutateAsync(texts);
      clearStoredValues();

      return true;
    } catch {
      setError("텍스트 저장에 실패했습니다. 다시 시도해 주세요.");

      return false;
    }
  }

  const basicInfoElements = textElements.filter(
    (element) => element.type === "기본정보",
  );
  const subtitleElements = textElements.filter(
    (element) => element.type === "자막",
  );

  return (
    <div className="flex flex-col gap-8">
      {error && <p className="text-destructive text-sm font-medium">{error}</p>}

      {basicInfoElements.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-medium">기본정보</h2>
          {basicInfoElements.map((element) => (
            <label
              key={elementKey(element)}
              className="flex flex-col gap-1.5 text-sm font-medium"
            >
              {removeHyphens(element.name)}
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
              {removeHyphens(element.name)}
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

      <DraftStepNav
        prevHref={prevHref}
        nextHref={nextHref}
        onNext={handleNext}
        nextPending={update.isPending}
      />
    </div>
  );
}
