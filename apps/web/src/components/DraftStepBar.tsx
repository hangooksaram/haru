import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TemplateSwitcher } from "@/features/draft/components/TemplateSwitcher";
import { DRAFT_STEP_ORDER } from "@/features/draft/constants";
import { cn } from "@/lib/utils";

import type { DraftStep } from "@/features/draft/types";
import type { ReactNode } from "react";

const STEPS = ["기본정보", "사진", "자막", "확인·결제"];

type Props = {
  current: 0 | 1 | 2 | 3;
  templateId: string;
  templateName: string;
  // 가장 멀리 진행한 단계. 스테퍼에서 이 단계까지 눌러 이동할 수 있다.
  lastStep?: DraftStep;
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
  lastStep,
  prevHref,
  primaryLabel,
  onPrimaryClick,
  primaryPending,
  guidanceText,
  saveStatus,
}: Props) {
  const reachedIndex = Math.max(
    current,
    DRAFT_STEP_ORDER.indexOf(lastStep ?? "basic_info"),
  );

  return (
    <div className="bg-background sticky top-16 z-40 flex h-16 items-center gap-4 border-b lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <div className="flex min-w-0 items-center gap-2">
        <TemplateSwitcher templateId={templateId} templateName={templateName} />
        {saveStatus && <div className="hidden sm:block">{saveStatus}</div>}
      </div>

      <ol className="hidden items-center justify-center gap-2 lg:flex">
        {STEPS.map((label, index) => {
          const isCompleted = index < current;
          const isCurrent = index === current;
          const isLast = index === STEPS.length - 1;
          const isReached = index <= reachedIndex;
          const href =
            isReached && !isCurrent ? getStepHref(index, templateId) : null;

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
                    isReached={isReached}
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
                    isReached={isReached}
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
            className="text-muted-foreground shrink-0 text-base"
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
            className="h-11 shrink-0 px-4 text-base font-bold whitespace-nowrap"
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
          className="size-3.5"
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
  isReached: boolean;
  isCurrent: boolean;
};

function StepLabel({ label, isReached, isCurrent }: StepLabelProps) {
  return (
    <span
      className={cn(
        "text-base whitespace-nowrap",
        isCurrent
          ? "text-foreground font-semibold"
          : isReached
            ? "text-foreground font-medium"
            : "text-muted-foreground font-medium",
      )}
    >
      {label}
    </span>
  );
}
