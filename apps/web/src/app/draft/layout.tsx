import { SiteHeader } from "@/components/SiteHeader";
import { CONTAINER_PADDING_X } from "@/lib/layout";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
};

export default function DraftLayout({ children }: Props) {
  return (
    <>
      <SiteHeader variant="minimal" />
      <main className={cn("mx-auto max-w-[1280px]", CONTAINER_PADDING_X)}>
        {children}
      </main>
    </>
  );
}
