import Link from "next/link";

import { Button } from "@/components/ui/button";

type Props = {
  prevHref: string;
  nextHref?: string;
};

export function DraftStepNav({ prevHref, nextHref }: Props) {
  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="outline" size="lg">
        <Link href={prevHref}>이전</Link>
      </Button>
      {nextHref && (
        <Button asChild size="lg">
          <Link href={nextHref}>다음</Link>
        </Button>
      )}
    </div>
  );
}
