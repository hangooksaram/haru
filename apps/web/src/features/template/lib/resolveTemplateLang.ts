import type { TemplateLang } from "@/features/template/types";

// 없거나 지원하지 않는 값이면 ko로 본다.
export function resolveTemplateLang(lang: string | null): TemplateLang {
  return lang === "en" ? "en" : "ko";
}
