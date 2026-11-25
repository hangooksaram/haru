import type { TemplateTextElement } from "@/features/template/types";

// 기본정보는 Creatomate {{placeholder}} 이름 그대로, 자막은 템플릿 요소 이름(자막_번호)을 쓴다.
export function elementKey({
  type,
  name,
}: Pick<TemplateTextElement, "type" | "name">): string {
  return type === "기본정보" ? name : `${type}_${name}`;
}
