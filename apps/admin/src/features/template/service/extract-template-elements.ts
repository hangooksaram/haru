import type { CreatomateElement } from "@/lib/creatomate";
import type { TemplateElement } from "@/features/template/types";

const PLACEHOLDER_PATTERN = /\{\{[^{}]+\}\}/;

// 기본정보는 dynamic이 아닌 텍스트 안의 {{placeholder}}로 정의하므로 함께 저장한다.
function isStorableText(
  element: CreatomateElement,
): element is CreatomateElement & { name: string; text: string } {
  if (element.type !== "text") return false;
  if (element.name === undefined || element.text === undefined) return false;

  return element.dynamic === true || PLACEHOLDER_PATTERN.test(element.text);
}

// composition은 중첩될 수 있으므로 안쪽 요소까지 재귀적으로 탐색해 평평한 배열로 만든다.
// video/audio/shape/composition 자체는 고정 요소이므로 저장하지 않는다.
export function extractTemplateElements(
  elements: CreatomateElement[],
): TemplateElement[] {
  const result: TemplateElement[] = [];

  for (const element of elements) {
    if (
      element.dynamic &&
      element.type === "image" &&
      element.name !== undefined
    ) {
      result.push({
        id: element.id,
        name: element.name,
        type: "image",
        source: element.source,
      });
    } else if (isStorableText(element)) {
      result.push({
        id: element.id,
        name: element.name,
        type: "text",
        text: element.text,
      });
    } else if (element.type === "composition" && element.elements) {
      result.push(...extractTemplateElements(element.elements));
    }
  }

  return result;
}
