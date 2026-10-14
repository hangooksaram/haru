export function countPhotoElements(elements: unknown): number {
  if (!Array.isArray(elements)) return 0;

  return elements.filter(
    (element) =>
      typeof element === "object" &&
      element !== null &&
      (element as { type?: unknown }).type === "image",
  ).length;
}
