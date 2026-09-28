import { cn } from "@/lib/utils";

const STEPS = ["템플릿 선택", "사진", "텍스트", "미리보기", "결제"];

type Props = {
  current: number;
};

export function DraftStepper({ current }: Props) {
  return (
    <ol className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      {STEPS.map((label, index) => {
        const isCurrent = index === current;

        return (
          <li
            key={label}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 font-medium",
              isCurrent ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-bold",
                isCurrent ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              {index + 1}
            </span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}
