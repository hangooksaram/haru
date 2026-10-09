import type { CreatomateElement } from "@/lib/creatomate";
import type { TemplateElement } from "@/features/template/types";

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
      element.name !== undefined &&
      element.source !== undefined
    ) {
      result.push({
        id: element.id,
        name: element.name,
        type: "image",
        source: element.source,
      });
    } else if (
      element.dynamic &&
      element.type === "text" &&
      element.name !== undefined &&
      element.text !== undefined
    ) {
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
