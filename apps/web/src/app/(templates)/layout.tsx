import { SiteHeader } from "@/components/SiteHeader";

type Props = {
  children: React.ReactNode;
};

export default function TemplatesGroupLayout({ children }: Props) {
  return (
    <>
      <SiteHeader variant="minimal" />
      {children}
    </>
  );
}
