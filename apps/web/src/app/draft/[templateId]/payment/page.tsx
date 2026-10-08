import { DraftStepNav } from "@/components/DraftStepNav";
import { DraftStepper } from "@/components/DraftStepper";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function DraftPaymentPage({ params }: Props) {
  const { templateId } = await params;

  return (
    <div className="flex flex-col gap-10 py-10">
      <DraftStepper current={4} />
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        결제
      </h1>
      <DraftStepNav prevHref={`/draft/${templateId}/preview`} />
    </div>
  );
}
