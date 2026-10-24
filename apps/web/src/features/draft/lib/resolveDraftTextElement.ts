import type {
  TemplateTextElement,
  TemplateTextElementType,
} from "@/features/template/types";

type ResolvedDraftTextElement = {
  name: string;
  type: TemplateTextElementType;
};

function normalizeType(type: string): TemplateTextElementType | null {
  const normalized = type.normalize("NFC").replace(/\s+/g, "");

  if (normalized === "기본정보") return "기본정보";
  if (normalized === "자막") return "자막";

  return null;
}

export function resolveDraftTextElement(
  type: string,
  name: string,
  templateTextElements: TemplateTextElement[],
): ResolvedDraftTextElement | null {
  const normalizedType = normalizeType(type);
  if (!normalizedType) return null;

  const exists = templateTextElements.some(
    (element) => element.type === normalizedType && element.name === name,
  );
  if (!exists) return null;

  return { name: `${normalizedType}_${name}`, type: normalizedType };
}
