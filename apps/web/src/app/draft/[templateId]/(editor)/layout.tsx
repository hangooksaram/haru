import { preconnect } from "react-dom";

import { DraftEditorShell } from "@/features/draft/components/DraftEditorShell";
import { DraftPreviewProvider } from "@/features/draft/components/DraftPreviewProvider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ templateId: string }>;
};

export default async function DraftEditorLayout({ children, params }: Props) {
  const { templateId } = await params;

  // 미리보기 플레이어 iframe(creatomate.com/embed)의 연결을 미리 맺는다.
  preconnect("https://creatomate.com");

  return (
    <DraftPreviewProvider templateId={templateId}>
      <DraftEditorShell>{children}</DraftEditorShell>
    </DraftPreviewProvider>
  );
}
