import { DraftStepper } from "@/components/DraftStepper";
import { DraftPhotosStep } from "@/features/draft/components/DraftPhotosStep";
import { resolveDraftStepReturnHref } from "@/features/draft/lib/resolveDraftStepReturnHref";

type Props = {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ return?: string }>;
};

export default async function DraftPhotosPage({ params, searchParams }: Props) {
  const { templateId } = await params;
  const { return: returnParam } = await searchParams;

  const nextHref = resolveDraftStepReturnHref(
    templateId,
    `/draft/${templateId}/text`,
    returnParam,
  );

  return (
    <div className="flex flex-col gap-10 py-10">
      <DraftStepper current={1} />
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        사진을 올려 주세요
      </h1>
      <DraftPhotosStep
        templateId={templateId}
        prevHref="/templates"
        nextHref={nextHref}
      />
    </div>
  );
}
