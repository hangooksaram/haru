import { CONTAINER_PADDING_X } from "@/lib/layout";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
};

export default function TemplatesLayout({ children }: Props) {
  return (
    <main className={cn("mx-auto max-w-7xl", CONTAINER_PADDING_X)}>
      {children}
    </main>
  );
}
