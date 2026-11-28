import { isBasicInfoComplete } from "@/features/draft/lib/isBasicInfoComplete";
import { isLaterDraftStep } from "@/features/draft/lib/isLaterDraftStep";
import { extractSortedPhotoElements } from "@/features/template/lib/extractSortedPhotoElements";
import { extractSortedTextElements } from "@/features/template/lib/extractSortedTextElements";

import type { DraftSavedText, DraftStep } from "@/features/draft/types";

type Params = {
  lastStep: DraftStep;
  templateElements: unknown;
  texts: DraftSavedText[];
  photoNames: string[];
};

// 정책: 기존 시안을 다시 열면 last_step으로 이동하되, 그 이전 단계에 필수 항목이 비어 있으면 필수 항목이 빈 첫 단계로 이동한다.
// 필수 항목은 기본정보 전체와 사진 전체다. 자막은 필수가 아니다.
export function resolveDraftResumeStep({
  lastStep,
  templateElements,
  texts,
  photoNames,
}: Params): DraftStep {
  if (
    isLaterDraftStep(lastStep, "basic_info") &&
    !isBasicInfoComplete(extractSortedTextElements(templateElements), texts)
  ) {
    return "basic_info";
  }

  const uploaded = new Set(photoNames);
  const isPhotosComplete = extractSortedPhotoElements(templateElements).every(
    (name) => uploaded.has(name),
  );
  if (isLaterDraftStep(lastStep, "photos") && !isPhotosComplete) {
    return "photos";
  }

  return lastStep;
}
