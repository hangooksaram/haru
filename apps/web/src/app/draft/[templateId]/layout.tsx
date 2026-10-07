import { notFound } from "next/navigation";

import { getTemplate } from "@haru/db";

type Props = {
  children: React.ReactNode;
  params: Promise<{ templateId: string }>;
};

export default async function DraftTemplateLayout({
  children,
  params,
}: Props) {
  const { templateId } = await params;
  const template = await getTemplate(templateId);

  if (!template) notFound();

  return children;
}
