import { DraftStepNav } from "@/components/draft-step-nav";
import { DraftStepper } from "@/components/draft-stepper";
import { getTemplate } from "@haru/db";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function DraftPhotosPage({ params }: Props) {
  const { templateId } = await params;

  console.log("[template info]", await getTemplate(templateId));

  return (
    <div className="flex flex-col gap-10 py-10">
      <DraftStepper current={1} />
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        사진을 올려 주세요
      </h1>
      <DraftStepNav prevHref="/draft" nextHref={`/draft/${templateId}/text`} />
    </div>
  );
}
