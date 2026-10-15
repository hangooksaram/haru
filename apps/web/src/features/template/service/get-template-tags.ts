import { prisma } from "@haru/db";

import { extractUniqueTags } from "@/features/template/lib/extractUniqueTags";

// 카테고리 선택(노션 "카테고리 선택" 문서) 화면에 보여줄, 공개 템플릿에 실제로 쓰인 태그만 중복 제거해 반환한다.
export async function getTemplateTags(): Promise<string[]> {
  const templates = await prisma.template.findMany({
    where: { isActive: true },
    select: { tags: true },
  });

  return extractUniqueTags(templates.map((template) => template.tags));
}
