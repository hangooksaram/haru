// 정책: 드래그로 순서만 변경 가능 — 기존 사진 목록과 정확히 일치하는 순서만 허용
export function isValidPhotoOrder(
  existingIds: string[],
  requestedIds: string[],
): boolean {
  const existingSet = new Set(existingIds);

  return (
    requestedIds.length === existingSet.size &&
    requestedIds.every((id) => existingSet.has(id))
  );
}
