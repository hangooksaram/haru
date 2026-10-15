// 정책: tag 쿼리스트링이 없거나 필터 목록에 없는 값이면 무시하고 전체를 보여준다
export function resolveInitialTag(
  tag: string | undefined,
  tagOptions: readonly string[],
): string | null {
  return tag && tagOptions.includes(tag) ? tag : null;
}
