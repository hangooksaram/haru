import { DraftStepper } from "@/components/DraftStepper";
import { DraftPreviewStep } from "@/features/draft/components/DraftPreviewStep";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function DraftPreviewPage({ params }: Props) {
  const { templateId } = await params;

  return (
    <div className="flex flex-col gap-10 py-10">
      <DraftStepper current={3} />
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        미리보기
      </h1>
      <DraftPreviewStep templateId={templateId} />
    </div>
  );
}
