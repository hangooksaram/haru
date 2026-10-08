import { prisma } from "@haru/db";

import { getCreatomateTemplates } from "@/lib/creatomate";

import type { TemplateSyncStatus, Template } from "@/features/template/types";

function getSyncStatus(
  externalUpdatedAt: string,
  imported: { updatedAt: Date } | undefined,
): TemplateSyncStatus {
  if (!imported) return "not_imported";
  if (new Date(externalUpdatedAt).getTime() > imported.updatedAt.getTime()) {
    return "changed";
  }
  return "imported";
}

// 외부 목록과 우리 DB를 대조해 템플릿별 가져오기 상태를 계산한다.
export async function getTemplatesWithSyncStatus(): Promise<Template[]> {
  const [externalTemplates, importedTemplates] = await Promise.all([
    getCreatomateTemplates(),
    prisma.template.findMany(),
  ]);

  const importedById = new Map(
    importedTemplates.map((template) => [template.id, template]),
  );

  return externalTemplates.map((template) => {
    const imported = importedById.get(template.id);
    const status = getSyncStatus(template.updated_at, imported);

    return {
      id: template.id,
      name: template.name,
      createdAt: template.created_at,
      status,
      price: imported?.price ?? null,
      isActive: imported?.isActive ?? false,
      tags: imported?.tags ?? null,
      updatedAt: imported?.updatedAt.toISOString() ?? null,
      source: imported?.source ?? null,
    };
  });
}
