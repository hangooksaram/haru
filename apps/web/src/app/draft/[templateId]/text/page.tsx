import { DraftStepper } from "@/components/DraftStepper";
import { DraftTextStep } from "@/features/draft/components/DraftTextStep";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function DraftTextPage({ params }: Props) {
  const { templateId } = await params;

  return (
    <div className="flex flex-col gap-4 py-4">
      <DraftStepper current={2} templateId={templateId} />
      <DraftTextStep
        templateId={templateId}
        prevHref={`/draft/${templateId}/photos`}
        nextHref={`/draft/${templateId}/preview`}
      />
    </div>
  );
}
