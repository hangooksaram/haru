import Link from "next/link";

import { Button } from "@/components/ui/button";

type Props = {
  message: string;
  showBrowseTemplatesButton?: boolean;
};

export function EmptyVideosState({
  message,
  showBrowseTemplatesButton = false,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-muted-foreground text-sm">{message}</p>
      {showBrowseTemplatesButton && (
        <Button asChild>
          <Link href="/templates">템플릿 둘러보기</Link>
        </Button>
      )}
    </div>
  );
}
