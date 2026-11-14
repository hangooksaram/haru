import { SiteHeader } from "@/components/SiteHeader";
import { getTemplateTags } from "@/features/template/service/get-template-tags";

type Props = {
  children: React.ReactNode;
};

export default async function WithHeaderLayout({ children }: Props) {
  const categories = await getTemplateTags();

  return (
    <>
      <SiteHeader categories={categories} />
      {children}
    </>
  );
}
