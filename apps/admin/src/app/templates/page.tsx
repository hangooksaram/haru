import { TemplateList } from "@/components/template-list";
import { getTemplatesWithSyncStatus } from "@/lib/template/template-sync";

export default async function AdminTemplatesPage() {
  const templates = await getTemplatesWithSyncStatus();

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-xl font-semibold">템플릿</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Creatomate 템플릿을 서비스 DB로 가져오거나 최신 상태로 업데이트합니다.
      </p>
      <TemplateList templates={templates} />
    </div>
  );
}
