import { elementKey } from "@/features/draft/lib/elementKey";
import { trimBlankText } from "@/features/draft/lib/trimBlankText";

import type { DraftSavedText } from "@/features/draft/types";
import type { TemplateTextElement } from "@/features/template/types";

// 템플릿의 기본정보가 모두 저장된 시안인지 판단한다. 저장된 텍스트 이름은 elementKey 기준이다.
export function isBasicInfoComplete(
  elements: TemplateTextElement[],
  savedTexts: DraftSavedText[],
): boolean {
  const savedByName = new Map(savedTexts.map(({ name, text }) => [name, text]));

  return elements
    .filter((element) => element.type === "기본정보")
    .every(
      (element) =>
        trimBlankText(savedByName.get(elementKey(element)) ?? "") !== "",
    );
}
