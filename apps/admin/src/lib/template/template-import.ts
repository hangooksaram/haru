import { prisma } from "@haru/db";

import { getTemplate } from "@/lib/creatomate";

export type ImportResult =
  | { success: true; id: string; result: "imported" | "updated" }
  | { success: false; step: "fetch" | "save"; message: string };

export async function importOrUpdateTemplate(
  id: string,
): Promise<ImportResult> {
  let detail;
  try {
    detail = await getTemplate(id);
  } catch (error) {
    console.error("[템플릿 가져오기] 외부 조회 실패", error);
    return {
      success: false,
      step: "fetch",
      message: "템플릿 조회 중 오류가 발생했습니다.",
    };
  }

  if (!detail) {
    return {
      success: false,
      step: "fetch",
      message: "존재하지 않는 템플릿 id입니다.",
    };
  }

  try {
    const existing = await prisma.template.findUnique({
      where: { id },
      select: { id: true },
    });

    await prisma.template.upsert({
      where: { id },
      create: {
        id: detail.id,
        name: detail.name,
        tags: detail.tags,
        createdAt: new Date(detail.created_at),
        updatedAt: new Date(detail.updated_at),
        source: detail.source,
      },
      update: {
        name: detail.name,
        tags: detail.tags,
        updatedAt: new Date(detail.updated_at),
        source: detail.source,
      },
    });

    return { success: true, id, result: existing ? "updated" : "imported" };
  } catch (error) {
    console.error("[템플릿 가져오기] DB 저장 실패", error);
    return {
      success: false,
      step: "save",
      message: "DB 저장 중 오류가 발생했습니다.",
    };
  }
}
