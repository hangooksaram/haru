// 정책: 카테고리는 템플릿의 tags를 그대로, 중복 없이 사용한다
export function extractUniqueTags(tagLists: string[][]): string[] {
  const tags = new Set<string>();

  for (const list of tagLists) {
    for (const tag of list) tags.add(tag);
  }

  return [...tags];
}
