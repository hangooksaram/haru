"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { DRAFT_STEP_SEGMENTS } from "@/features/draft/constants";
import { useDraft } from "@/features/draft/hooks/useDraft";

type Props = {
  templateId: string;
};

// 시안 생성 스텝 진입 주소(/draft/{templateId})에서 들어갈 단계를 정한다.
// 정책: 같은 세션 안에서 다시 들어오면 이어하기 모달 없이 시안의 last_step(필수 항목이 빈 단계가 있으면 그 첫 단계)으로 이동한다.
// 그 밖의 경우는 기본정보로 보내고, 이어하기 모달이 필요하면 거기서 띄운다.
export function DraftEntryRedirect({ templateId }: Props) {
  const router = useRouter();
  const { draftId, isFreshlyCreated } = useDraftId();
  const { data: draft, isError } = useDraft(
    draftId && isFreshlyCreated ? draftId : null,
  );

  useEffect(() => {
    if (draftId === undefined) return;

    if (draftId && isFreshlyCreated && !isError) {
      if (!draft) return;
      router.replace(
        `/draft/${templateId}/${DRAFT_STEP_SEGMENTS[draft.resumeStep]}`,
      );
      return;
    }

    router.replace(`/draft/${templateId}/basic-info`);
  }, [draftId, isFreshlyCreated, draft, isError, templateId, router]);

  return null;
}
