import type {
  TemplateTextElement,
  TemplateTextElementType,
} from "@/features/template/types";

function classify(prefix: string): TemplateTextElementType | null {
  const normalized = prefix.normalize("NFC").replace(/\s+/g, "");

  if (normalized === "기본정보") return "기본정보";
  if (normalized === "자막") return "자막";

  return null;
}

function toTextElement(element: unknown): TemplateTextElement | null {
  if (typeof element !== "object" || element === null) return null;

  const { type, name, text } = element as {
    type?: unknown;
    name?: unknown;
    text?: unknown;
  };

  if (type !== "text" || typeof name !== "string" || typeof text !== "string") {
    return null;
  }

  const separatorIndex = name.indexOf("_");
  if (separatorIndex === -1) return null;

  const elementType = classify(name.slice(0, separatorIndex));
  if (!elementType) return null;

  return { type: elementType, name: name.slice(separatorIndex + 1), text };
}

function sortSubtitles(elements: TemplateTextElement[]): TemplateTextElement[] {
  const result = [...elements];
  const subtitleIndexes = result
    .map((_, index) => index)
    .filter((index) => result[index].type === "자막");
  const sortedSubtitles = subtitleIndexes
    .map((index) => result[index])
    .sort((a, b) => Number(a.name) - Number(b.name));

  subtitleIndexes.forEach((index, i) => {
    result[index] = sortedSubtitles[i];
  });

  return result;
}

export function extractSortedTextElements(
  elements: unknown,
): TemplateTextElement[] {
  if (!Array.isArray(elements)) return [];

  const parsed = elements
    .map(toTextElement)
    .filter((element): element is TemplateTextElement => element !== null);

  return sortSubtitles(parsed);
}
