import type { PhotoLabelGroup } from "@/features/draft/lib/groupPhotoLabels";

// 정책: 모든 슬롯을 채운 라벨 수를 "4/6 라벨 완료"처럼 상단에 보여준다.
export function countCompletedPhotoLabels(
  groups: PhotoLabelGroup[],
  filledSlotNames: string[],
): number {
  const filled = new Set(filledSlotNames);

  return groups.filter((group) =>
    group.slotNames.every((name) => filled.has(name)),
  ).length;
}
