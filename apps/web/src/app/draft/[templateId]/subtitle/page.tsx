import { DraftTextStep } from "@/features/draft/components/DraftTextStep";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function DraftSubtitlePage({ params }: Props) {
  const { templateId } = await params;

  return (
    <div className="flex flex-col gap-4 py-4">
      <DraftTextStep
        textType="자막"
        templateId={templateId}
        prevHref={`/draft/${templateId}/basic-info`}
        nextHref={`/draft/${templateId}/preview`}
      />
    </div>
  );
}
