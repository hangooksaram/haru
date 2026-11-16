"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function HeaderLoginLink() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const next = `${pathname}${search ? `?${search}` : ""}`;

  return (
    <Button asChild variant="outline" size="sm" className="text-foreground">
      <Link href={`/login?next=${encodeURIComponent(next)}`}>로그인</Link>
    </Button>
  );
}
