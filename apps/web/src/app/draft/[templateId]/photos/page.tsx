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
      <DraftPhotosStep
        templateId={templateId}
        nextHref={`/draft/${templateId}/basic-info`}
        showPreviewShortcut={returnParam === "preview"}
      />
    </div>
  );
}
