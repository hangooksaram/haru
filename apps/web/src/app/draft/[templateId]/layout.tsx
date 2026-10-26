import { DraftIdProvider } from "@/features/draft/components/DraftIdProvider";
import { DraftResumeDialog } from "@/features/draft/components/DraftResumeDialog";

type Props = {
  children: React.ReactNode;
  params: Promise<{ templateId: string }>;
};

export default async function DraftTemplateLayout({
  children,
  params,
}: Props) {
  const { templateId } = await params;

  return (
    <DraftIdProvider templateId={templateId}>
      <DraftResumeDialog />
      {children}
    </DraftIdProvider>
  );
}
