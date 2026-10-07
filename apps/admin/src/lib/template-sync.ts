import { prisma } from "@haru/db";

import { getTemplates } from "@/lib/creatomate";

export type TemplateSyncStatus = "not_imported" | "imported" | "changed";

export type TemplateRecord = {
  id: string;
  name: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  source: unknown;
};

export type TemplateWithStatus = {
  id: string;
  name: string;
  createdAt: string;
  status: TemplateSyncStatus;
  price: number | null;
  isActive: boolean;
  record: TemplateRecord | null;
};

// 외부 목록과 우리 DB를 대조해 템플릿별 가져오기 상태를 계산한다.
export async function getTemplatesWithSyncStatus(): Promise<
  TemplateWithStatus[]
> {
  const [externalTemplates, importedTemplates] = await Promise.all([
    getTemplates(),
    prisma.template.findMany(),
  ]);

  const importedById = new Map(
    importedTemplates.map((template) => [template.id, template]),
  );

  return externalTemplates.map((template) => {
    const imported = importedById.get(template.id);

    let status: TemplateSyncStatus;
    if (!imported) {
      status = "not_imported";
    } else if (
      new Date(template.updated_at).getTime() > imported.updatedAt.getTime()
    ) {
      status = "changed";
    } else {
      status = "imported";
    }

    return {
      id: template.id,
      name: template.name,
      createdAt: template.created_at,
      status,
      price: imported?.price ?? null,
      isActive: imported?.isActive ?? false,
      record: imported
        ? {
            id: imported.id,
            name: imported.name,
            tags: imported.tags,
            createdAt: imported.createdAt.toISOString(),
            updatedAt: imported.updatedAt.toISOString(),
            source: imported.source,
          }
        : null,
    };
  });
}
