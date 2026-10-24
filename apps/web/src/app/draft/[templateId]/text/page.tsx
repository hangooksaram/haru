import { DraftStepper } from "@/components/DraftStepper";
import { DraftTextStep } from "@/features/draft/components/DraftTextStep";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function DraftTextPage({ params }: Props) {
  const { templateId } = await params;

  return (
    <div className="flex flex-col gap-10 py-10">
      <DraftStepper current={2} />
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        텍스트를 입력해 주세요
      </h1>
      <DraftTextStep
        templateId={templateId}
        prevHref={`/draft/${templateId}/photos`}
        nextHref={`/draft/${templateId}/preview`}
      />
    </div>
  );
}
