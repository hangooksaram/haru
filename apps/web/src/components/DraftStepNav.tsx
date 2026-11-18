"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import type { ReactNode } from "react";

type Props = {
  prevHref: string;
  nextHref?: string;
  onNext?: () => Promise<boolean>;
  nextPending?: boolean;
  extra?: ReactNode;
};

export function DraftStepNav({
  prevHref,
  nextHref,
  onNext,
  nextPending,
  extra,
}: Props) {
  const router = useRouter();

  async function handleNext() {
    if (!nextHref) return;

    const canProceed = onNext ? await onNext() : true;
    if (canProceed) router.push(nextHref);
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        asChild
        variant="secondary"
        size="lg"
        className="h-12 px-6 text-base font-semibold"
      >
        <Link href={prevHref}>이전</Link>
      </Button>
      {nextHref &&
        (onNext ? (
          <Button
            size="lg"
            className="h-12 px-6 text-base font-semibold"
            onClick={handleNext}
            disabled={nextPending}
          >
            다음
          </Button>
        ) : (
          <Button
            asChild
            size="lg"
            className="h-12 px-6 text-base font-semibold"
          >
            <Link href={nextHref}>다음</Link>
          </Button>
        ))}
      {extra}
    </div>
  );
}
