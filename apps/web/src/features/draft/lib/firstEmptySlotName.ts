// 정책: 라벨 줄 위 어디에 놓아도 그 라벨의 빈 슬롯부터 채운다.
export function firstEmptySlotName(
  slots: { name: string; photo: unknown }[],
): string | undefined {
  return slots.find((slot) => slot.photo === null)?.name;
}
