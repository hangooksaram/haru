import type { TemplateTextElement } from "@/features/template/types";

export function elementKey(element: TemplateTextElement): string {
  return `${element.type}_${element.name}`;
}
