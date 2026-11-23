import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function DraftTextPage({ params }: Props) {
  const { templateId } = await params;

  redirect(`/draft/${templateId}/basic-info`);
}
