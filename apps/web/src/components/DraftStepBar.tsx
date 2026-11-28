import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

const STEPS = ["기본정보", "사진", "자막", "확인·결제"];

type Props = {
  current: 0 | 1 | 2 | 3;
  templateId: string;
  templateName: string;
  prevHref?: string;
  primaryLabel?: string;
  onPrimaryClick?: () => void;
  primaryPending?: boolean;
  guidanceText?: string;
  saveStatus?: ReactNode;
};

function getStepHref(index: number, templateId: string) {
  switch (index) {
    case 0:
      return `/draft/${templateId}/basic-info`;
    case 1:
      return `/draft/${templateId}/photos`;
    case 2:
      return `/draft/${templateId}/subtitle`;
    case 3:
      return `/draft/${templateId}/payment`;
    default:
      return null;
  }
}

export function DraftStepBar({
  current,
  templateId,
  templateName,
  prevHref,
  primaryLabel,
  onPrimaryClick,
  primaryPending,
  guidanceText,
  saveStatus,
}: Props) {
  return (
    <div className="bg-background sticky top-16 z-40 flex h-16 items-center gap-4 border-b lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <div className="flex min-w-0 items-center gap-2">
        <span
          title={templateName}
          className="max-w-40 shrink-0 truncate text-[15px] font-medium sm:max-w-60"
        >
          {templateName}
        </span>
        {saveStatus && <div className="hidden sm:block">{saveStatus}</div>}
      </div>

      <ol className="hidden items-center justify-center gap-2 lg:flex">
        {STEPS.map((label, index) => {
          const isCompleted = index < current;
          const isCurrent = index === current;
          const isLast = index === STEPS.length - 1;
          const href = isCompleted ? getStepHref(index, templateId) : null;

          return (
            <li
              key={label}
              aria-current={isCurrent ? "step" : undefined}
              className="flex items-center"
            >
              {href ? (
                <Link href={href} className="flex items-center gap-1.5">
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
                <div className="flex items-center gap-1.5">
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
                    "mx-2 h-0.5 w-8 rounded-full",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="ml-auto flex min-w-0 items-center justify-end gap-3">
        {prevHref && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground shrink-0 cursor-pointer text-[15px]"
          >
            <Link href={prevHref}>← 이전</Link>
          </Button>
        )}
        {guidanceText && (
          <p
            title={guidanceText}
            className="text-muted-foreground hidden max-w-48 min-w-0 truncate text-xs lg:block"
          >
            {guidanceText}
          </p>
        )}
        {primaryLabel && onPrimaryClick && (
          <Button
            className="h-[42px] shrink-0 cursor-pointer px-4 text-[15px] font-bold whitespace-nowrap"
            onClick={onPrimaryClick}
            disabled={primaryPending}
          >
            {primaryPending && (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            )}
            {primaryLabel}
          </Button>
        )}
      </div>
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
        "flex size-6 items-center justify-center rounded-full text-sm font-bold",
        isCompleted || isCurrent
          ? "bg-primary text-primary-foreground"
          : "border-border text-muted-foreground border-2",
      )}
    >
      {isCompleted ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-3"
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
        "text-[15px] whitespace-nowrap",
        isCurrent
          ? "text-foreground font-semibold"
          : isCompleted
            ? "text-foreground font-medium"
            : "text-muted-foreground font-medium",
      )}
    >
      {label}
    </span>
  );
}
