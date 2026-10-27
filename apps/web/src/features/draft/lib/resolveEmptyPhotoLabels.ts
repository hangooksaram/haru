// 정책: 템플릿 사진 요소 순서대로 빈 라벨을 계산한다 (업로드 순서대로 빈 라벨에 채우기 위함)
// targetLabel이 주어지면(특정 빈 슬롯에 업로드한 경우) 그 라벨을 맨 앞으로 보내 1순위로 채운다.
export function resolveEmptyPhotoLabels(
  labels: string[],
  filledLabels: string[],
  targetLabel?: string,
): string[] {
  const filled = new Set(filledLabels);
  const empty = labels.filter((label) => !filled.has(label));

  if (!targetLabel || !empty.includes(targetLabel)) return empty;

  return [targetLabel, ...empty.filter((label) => label !== targetLabel)];
}
