import { DraftBasicInfoStep } from "@/features/draft/components/DraftBasicInfoStep";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function DraftBasicInfoPage({ params }: Props) {
  const { templateId } = await params;

  return (
    <DraftBasicInfoStep
      templateId={templateId}
      nextHref={`/draft/${templateId}/photos`}
    />
  );
}
