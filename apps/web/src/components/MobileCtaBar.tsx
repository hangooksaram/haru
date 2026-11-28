import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CTA_BUTTON } from "@/lib/styles";
import { cn } from "@/lib/utils";

// 스크롤해도 시안 시작 버튼이 항상 보이도록 모바일 화면 하단에 고정한다.
export function MobileCtaBar() {
  return (
    <div className="sticky bottom-0 border-t bg-background px-5 py-3 sm:hidden">
      <Button asChild size="lg" className={cn(CTA_BUTTON, "w-full")}>
        <Link href="/templates">시안 만들기</Link>
      </Button>
    </div>
  );
}
