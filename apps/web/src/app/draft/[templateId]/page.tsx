import { DraftEntryRedirect } from "@/features/draft/components/DraftEntryRedirect";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function DraftTemplatePage({ params }: Props) {
  const { templateId } = await params;

  return <DraftEntryRedirect templateId={templateId} />;
}
