import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  progress?: { filled: number; total: number };
  action?: ReactNode;
  sticky?: boolean;
};

// 시안·결제 스텝 본문 상단의 제목과 안내 문구. progress가 있으면 제목 옆에 채운 수/전체 수를 보여준다.
// sticky면 제목 줄만 스텝 바 아래에 고정한다. sticky는 부모 박스 안에서만 동작하므로
// 이때는 감싸지 않고 본문 영역의 직속 자식으로 렌더링한다.
export function DraftStepTitle({
  title,
  description,
  progress,
  action,
  sticky,
}: Props) {
  const heading = (
    <div
      className={cn(
        "flex items-center gap-4",
        // 그리드 간격(16px)만큼 끌어올리고 그만큼 위 여백을 채워, 스크롤 전후 제목 위치가 같고 틈으로 내용이 비치지 않게 한다.
        sticky && "bg-background sticky top-32 z-30 -mt-4 pt-4 pb-1",
      )}
    >
      <div className="flex items-baseline gap-2">
        <h2 className="text-xl font-bold">{title}</h2>
        {progress && (
          <span className="text-muted-foreground text-base tabular-nums">
            <strong className="text-foreground font-bold">
              {progress.filled}
            </strong>{" "}
            / {progress.total}
          </span>
        )}
      </div>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
  const descriptionText = (
    <p className="text-muted-foreground text-sm">{description}</p>
  );

  if (sticky) {
    return (
      <>
        {heading}
        {descriptionText}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {heading}
      {descriptionText}
    </div>
  );
}
