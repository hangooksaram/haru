"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { useDraft } from "@/features/draft/hooks/useDraft";
import { isBasicInfoComplete } from "@/features/draft/lib/isBasicInfoComplete";
import { useTemplateTextElements } from "@/features/template/hooks/useTemplateTextElements";

// 시안이 없거나 기본정보가 모두 채워지지 않았으면 기본정보 단계로 보낸다.
export function useRequireBasicInfo(templateId: string, enabled = true) {
  const router = useRouter();
  const { draftId } = useDraftId();
  const { data: draft, isFetchedAfterMount } = useDraft(draftId ?? null);
  const { data: elements } = useTemplateTextElements(templateId);

  useEffect(() => {
    if (!enabled || draftId === undefined) return;

    const redirectToBasicInfo = () =>
      router.replace(`/draft/${templateId}/basic-info`);

    if (draftId === null) {
      redirectToBasicInfo();
      return;
    }

    // 캐시에 남은 이전 시안 데이터로 판단하지 않도록 마운트 뒤 조회가 끝난 값만 쓴다.
    if (!draft || !elements || !isFetchedAfterMount) return;

    if (!isBasicInfoComplete(elements, draft.texts)) redirectToBasicInfo();
  }, [
    enabled,
    draftId,
    draft,
    elements,
    isFetchedAfterMount,
    router,
    templateId,
  ]);
}
