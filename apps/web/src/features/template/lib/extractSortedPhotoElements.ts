function toPhotoElementName(element: unknown): string | null {
  if (typeof element !== "object" || element === null) return null;

  const { type, name } = element as { type?: unknown; name?: unknown };

  if (type !== "image" || typeof name !== "string") return null;

  return name;
}

export function extractSortedPhotoElements(elements: unknown): string[] {
  if (!Array.isArray(elements)) return [];

  return elements
    .map(toPhotoElementName)
    .filter((name): name is string => name !== null);
}
