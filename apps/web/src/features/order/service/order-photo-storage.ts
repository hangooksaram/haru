import { DRAFT_PHOTOS_BUCKET } from "@/features/draft/constants";

import type { SupabaseClient } from "@supabase/supabase-js";

// 정책: 전환 시 draft_photos의 실제 파일을 새 경로로 복사한다 (같은 버킷 내 copy, 재업로드 아님).
// storage_path만 복사하면 draft와 order가 같은 파일을 가리켜, draft 클린업 시 order 사진이 사라진다.
export async function copyDraftPhotoToOrderPhoto(
  supabase: SupabaseClient,
  fromPath: string,
  toPath: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from(DRAFT_PHOTOS_BUCKET)
    .copy(fromPath, toPath);

  if (error) throw error;
}
