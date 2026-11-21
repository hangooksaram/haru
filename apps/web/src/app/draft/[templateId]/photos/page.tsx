import { DraftStepper } from "@/components/DraftStepper";
import { DraftPhotosStep } from "@/features/draft/components/DraftPhotosStep";

type Props = {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ return?: string }>;
};

export default async function DraftPhotosPage({ params, searchParams }: Props) {
  const { templateId } = await params;
  const { return: returnParam } = await searchParams;

  return (
    <div className="flex flex-col gap-4 py-4">
      <DraftStepper current={0} templateId={templateId} />
      <DraftPhotosStep
        templateId={templateId}
        prevHref="/templates"
        nextHref={`/draft/${templateId}/text`}
        showPreviewShortcut={returnParam === "preview"}
      />
    </div>
  );
}
