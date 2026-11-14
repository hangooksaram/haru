import { prisma } from "@haru/db";

// 랜딩 히어로(DesktopHeroVideo, VideoSlider)에 노출할 대표 템플릿 4개를 조회한다.
export async function getHeroTemplates(): Promise<
  { id: string; name: string }[]
> {
  return prisma.template.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 4,
    select: { id: true, name: true },
  });
}
