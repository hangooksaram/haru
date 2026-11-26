import type { TemplateLang, TemplateSummary } from "@/features/template/types";

// 요청 언어의 문구가 비어 있으면 ko, ko도 비어 있으면 null이다.
export function resolveTemplateSummary(
  summary: TemplateSummary | null,
  lang: TemplateLang,
): string | null {
  return summary?.[lang]?.trim() || summary?.ko?.trim() || null;
}
