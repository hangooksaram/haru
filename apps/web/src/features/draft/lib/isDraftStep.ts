import { DRAFT_STEP_SEGMENTS } from "@/features/draft/constants";

import type { DraftStep } from "@/features/draft/types";

// drafts.last_step에 저장할 수 있는 값인지 확인한다.
export function isDraftStep(value: unknown): value is DraftStep {
  return typeof value === "string" && Object.hasOwn(DRAFT_STEP_SEGMENTS, value);
}
