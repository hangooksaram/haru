import type { Template } from "@/features/template/types";

// 정책: 템플릿 목록을 탐색하는 방법은 태그 필터(tags 기준)와 검색(name 기준)만 둔다
export function filterTemplates(
  templates: Template[],
  selectedTag: string | null,
  search: string,
): Template[] {
  const trimmedSearch = search.trim();

  return templates.filter((template) => {
    if (selectedTag && !template.tags.includes(selectedTag)) return false;
    if (trimmedSearch && !template.name.includes(trimmedSearch)) return false;
    return true;
  });
}
