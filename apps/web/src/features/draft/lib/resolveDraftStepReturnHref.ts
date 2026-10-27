// 정책: 최종 미리보기에서 "수정하기"로 들어온 단계는, 끝나면 최종 미리보기로 바로 복귀한다.
export function resolveDraftStepReturnHref(
  templateId: string,
  normalNextHref: string,
  returnParam: string | string[] | undefined,
): string {
  if (returnParam !== "preview") return normalNextHref;

  return `/draft/${templateId}/preview`;
}
