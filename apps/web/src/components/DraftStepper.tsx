import Link from "next/link";

import { cn } from "@/lib/utils";

const STEPS = ["템플릿 선택", "사진", "텍스트", "미리보기", "결제"];

type Props = {
  current: number;
  templateId?: string | null;
};

function getStepHref(index: number, templateId?: string | null) {
  if (index === 0) return "/templates";
  if (!templateId) return null;

  switch (index) {
    case 1:
      return `/draft/${templateId}/photos`;
    case 2:
      return `/draft/${templateId}/text`;
    case 3:
      return `/draft/${templateId}/preview`;
    case 4:
      return `/draft/${templateId}/payment`;
    default:
      return null;
  }
}

export function DraftStepper({ current, templateId }: Props) {
  return (
    <div className="overflow-x-auto">
      <ol className="flex min-w-max items-start">
        {STEPS.map((label, index) => {
          const isCompleted = index < current;
          const isCurrent = index === current;
          const isLast = index === STEPS.length - 1;
          const href = isCompleted ? getStepHref(index, templateId) : null;

          return (
            <li
              key={label}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-start",
                isLast ? "flex-none" : "flex-1",
              )}
            >
              {href ? (
                <Link href={href} className="flex flex-col items-center gap-2">
                  <StepCircle
                    index={index}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                  />
                  <StepLabel
                    label={label}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                  />
                </Link>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <StepCircle
                    index={index}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                  />
                  <StepLabel
                    label={label}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                  />
                </div>
              )}
              {!isLast && (
                <div
                  className={cn(
                    "mx-2 mt-[17px] h-0.5 min-w-6 flex-1 rounded-full",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

type StepCircleProps = {
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
};

function StepCircle({ index, isCompleted, isCurrent }: StepCircleProps) {
  return (
    <span
      className={cn(
        "flex size-9 items-center justify-center rounded-full text-sm font-bold",
        isCompleted || isCurrent
          ? "bg-primary text-primary-foreground"
          : "border-border text-muted-foreground border-2",
      )}
    >
      {isCompleted ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="5 13 10 18 19 7" />
        </svg>
      ) : (
        index + 1
      )}
    </span>
  );
}

type StepLabelProps = {
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
};

function StepLabel({ label, isCompleted, isCurrent }: StepLabelProps) {
  return (
    <span
      className={cn(
        "whitespace-nowrap",
        isCurrent
          ? "text-foreground text-base font-semibold"
          : isCompleted
            ? "text-foreground text-sm font-medium"
            : "text-muted-foreground text-sm font-medium",
      )}
    >
      {label}
    </span>
  );
}
