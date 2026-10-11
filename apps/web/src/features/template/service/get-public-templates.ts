import { prisma } from "@haru/db";

import type { Template } from "@/features/template/types";

function countPhotoElements(elements: unknown): number {
  if (!Array.isArray(elements)) return 0;

  return elements.filter(
    (element) =>
      typeof element === "object" &&
      element !== null &&
      (element as { type?: unknown }).type === "image",
  ).length;
}

// 템플릿 선택(노션 "템플릿 선택" 문서) 화면에 노출할, 공개 처리된 템플릿만 조회한다.
export async function getPublicTemplates(): Promise<Template[]> {
  const templates = await prisma.template.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      price: true,
      tags: true,
      duration: true,
      elements: true,
    },
  });

  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    price: template.price,
    tags: template.tags,
    duration: template.duration,
    photoCount: countPhotoElements(template.elements),
  }));
}
