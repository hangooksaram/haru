import { DraftSubtitleStep } from "@/features/draft/components/DraftSubtitleStep";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function DraftSubtitlePage({ params }: Props) {
  const { templateId } = await params;

  return (
    <DraftSubtitleStep
      templateId={templateId}
      prevHref={`/draft/${templateId}/photos`}
    />
  );
}
