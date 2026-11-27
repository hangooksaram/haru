import { DraftPhotosStep } from "@/features/draft/components/DraftPhotosStep";

type Props = {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ return?: string }>;
};

export default async function DraftPhotosPage({ params, searchParams }: Props) {
  const { templateId } = await params;
  const { return: returnParam } = await searchParams;

  return (
    <DraftPhotosStep
      templateId={templateId}
      prevHref={`/draft/${templateId}/basic-info`}
      nextHref={`/draft/${templateId}/subtitle`}
      showPreviewShortcut={returnParam === "preview"}
      returnToPayment={returnParam === "payment"}
    />
  );
}
