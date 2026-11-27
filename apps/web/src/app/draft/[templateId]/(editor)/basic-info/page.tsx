import { DraftBasicInfoStep } from "@/features/draft/components/DraftBasicInfoStep";

type Props = {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ return?: string }>;
};

export default async function DraftBasicInfoPage({
  params,
  searchParams,
}: Props) {
  const { templateId } = await params;
  const { return: returnParam } = await searchParams;

  return (
    <DraftBasicInfoStep
      templateId={templateId}
      nextHref={`/draft/${templateId}/photos`}
      returnToPayment={returnParam === "payment"}
    />
  );
}
