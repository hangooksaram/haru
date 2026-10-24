import type {
  TemplateTextElement,
  TemplateTextElementType,
} from "@/features/template/types";

function normalizeType(type: string): TemplateTextElementType | null {
  const normalized = type.normalize("NFC").replace(/\s+/g, "");

  if (normalized === "기본정보") return "기본정보";
  if (normalized === "자막") return "자막";

  return null;
}

export function resolveDraftTextElementName(
  type: string,
  name: string,
  templateTextElements: TemplateTextElement[],
): string | null {
  const normalizedType = normalizeType(type);
  if (!normalizedType) return null;

  const exists = templateTextElements.some(
    (element) => element.type === normalizedType && element.name === name,
  );

  return exists ? `${normalizedType}_${name}` : null;
}
