import { DraftStepper } from "@/components/DraftStepper";
import { DraftPreviewStep } from "@/features/draft/components/DraftPreviewStep";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function DraftPreviewPage({ params }: Props) {
  const { templateId } = await params;

  return (
    <div className="flex flex-col gap-4 py-4">
      <DraftStepper current={3} templateId={templateId} />
      <DraftPreviewStep templateId={templateId} />
    </div>
  );
}
