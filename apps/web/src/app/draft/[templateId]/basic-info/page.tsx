import { DraftTextStep } from "@/features/draft/components/DraftTextStep";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function DraftBasicInfoPage({ params }: Props) {
  const { templateId } = await params;

  return (
    <div className="flex flex-col gap-4 py-4">
      <DraftTextStep
        textType="기본정보"
        templateId={templateId}
        prevHref={`/draft/${templateId}/photos`}
        nextHref={`/draft/${templateId}/subtitle`}
      />
    </div>
  );
}
