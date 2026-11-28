import { DRAFT_STEP_ORDER } from "@/features/draft/constants";

import type { DraftStep } from "@/features/draft/types";

// step이 기준 단계보다 뒤 단계인지 판단한다.
export function isLaterDraftStep(step: DraftStep, base: DraftStep): boolean {
  return DRAFT_STEP_ORDER.indexOf(step) > DRAFT_STEP_ORDER.indexOf(base);
}
