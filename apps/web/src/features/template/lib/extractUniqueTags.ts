// 정책: 카테고리는 템플릿의 tags 중 한글 태그만, 중복 없이 사용한다
const KOREAN_ONLY_REGEX = /^[가-힣\s]+$/;

export function extractUniqueTags(tagLists: string[][]): string[] {
  const tags = new Set<string>();

  for (const list of tagLists) {
    for (const tag of list) {
      if (KOREAN_ONLY_REGEX.test(tag)) {
        tags.add(tag);
      }
    }
  }

  return [...tags];
}
