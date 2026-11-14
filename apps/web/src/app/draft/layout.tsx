import { SiteHeader } from "@/components/SiteHeader";

type Props = {
  children: React.ReactNode;
};

export default function DraftLayout({ children }: Props) {
  return (
    <>
      <SiteHeader variant="minimal" />
      <main className="mx-auto max-w-[1280px] px-5 sm:px-10 lg:px-[72px]">
        {children}
      </main>
    </>
  );
}
