type SelectAcceptablePhotosResult<T> = {
  accepted: T[];
  rejectedCount: number;
};

// 정책: 템플릿당 정해진 개수(slotCount)까지만 허용, 올린 순서를 유지하고 초과분은 거부
export function selectAcceptablePhotos<T>(
  items: T[],
  slotCount: number,
  existingCount: number,
): SelectAcceptablePhotosResult<T> {
  const remaining = Math.max(0, slotCount - existingCount);
  const accepted = items.slice(0, remaining);

  return { accepted, rejectedCount: items.length - accepted.length };
}
