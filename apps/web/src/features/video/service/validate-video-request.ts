import { getDraftPhotoSignedUrl } from "@/features/draft/service/draft-photo-storage";
import {
  requestCreatomateDryRun,
  type DryRunResult,
} from "@/features/video/service/creatomate-dry-run";

import type { SupabaseClient } from "@supabase/supabase-js";

type TextItem = { name: string; text: string };
type PhotoItem = { name: string; storagePath: string };

type VideoRequestDraft = {
  templateId: string;
  texts: TextItem[];
  photos: PhotoItem[];
};

// 주문 생성 직전 사전 검증. valid: false / warnings 처리는 남은 과제라 결과를 그대로 돌려준다.
// supabase는 호출자의 세션 클라이언트다(세션 없는 호출 경로 처리는 남은 과제).
export async function validateVideoRequest(
  supabase: SupabaseClient,
  draft: VideoRequestDraft,
): Promise<DryRunResult> {
  const modifications: Record<string, string> = {};

  for (const { name, text } of draft.texts) {
    modifications[name] = text;
  }

  for (const photo of draft.photos) {
    modifications[photo.name] = await getDraftPhotoSignedUrl(
      supabase,
      photo.storagePath,
    );
  }

  return requestCreatomateDryRun(draft.templateId, modifications);
}
