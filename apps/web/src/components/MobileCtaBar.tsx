import Link from "next/link";

import { Button } from "@/components/ui/button";

// 스크롤해도 시안 시작 버튼이 항상 보이도록 모바일 화면 하단에 고정한다.
export function MobileCtaBar() {
  return (
    <div className="sticky bottom-0 border-t bg-background px-5 py-3 sm:hidden">
      <Button asChild size="lg" className="h-14 w-full rounded-xl text-[17px] font-bold">
        <Link href="/templates/tags">시안 만들기</Link>
      </Button>
    </div>
  );
}
