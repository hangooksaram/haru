import type { TemplateTextElement } from "@/features/template/types";

const PLACEHOLDER_PATTERN = /\{\{\s*([^{}|]+?)\s*(?:\|[^{}]*)?\}\}/g;

function isSubtitlePrefix(prefix: string): boolean {
  return prefix.normalize("NFC").replace(/\s+/g, "") === "자막";
}

function toSubtitleElement(
  name: string,
  text: string,
): TemplateTextElement | null {
  const separatorIndex = name.indexOf("_");
  if (separatorIndex === -1) return null;
  if (!isSubtitlePrefix(name.slice(0, separatorIndex))) return null;

  return { type: "자막", name: name.slice(separatorIndex + 1), text };
}

function toBasicInfoElements(text: string): TemplateTextElement[] {
  return Array.from(text.matchAll(PLACEHOLDER_PATTERN), ([, name]) => ({
    type: "기본정보",
    name,
    text: "",
  }));
}

function toTextElements(element: unknown): TemplateTextElement[] {
  if (typeof element !== "object" || element === null) return [];

  const { type, name, text } = element as {
    type?: unknown;
    name?: unknown;
    text?: unknown;
  };

  if (type !== "text" || typeof name !== "string" || typeof text !== "string") {
    return [];
  }

  const subtitle = toSubtitleElement(name, text);
  if (subtitle) return [subtitle];

  return toBasicInfoElements(text);
}

function removeDuplicateBasicInfo(
  elements: TemplateTextElement[],
): TemplateTextElement[] {
  const seen = new Set<string>();

  return elements.filter((element) => {
    if (element.type !== "기본정보") return true;
    if (seen.has(element.name)) return false;
    seen.add(element.name);
    return true;
  });
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

  const parsed = removeDuplicateBasicInfo(elements.flatMap(toTextElements));

  return sortSubtitles(parsed);
}
