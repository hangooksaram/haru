import type { SupabaseClient } from "@supabase/supabase-js";

const DRAFT_PHOTOS_BUCKET = "draft-photos";
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60;

// 정책: 사진 접근에는 서비스 키를 쓰지 않고, 요청한 유저의 로그인 세션으로 저장소에 접근한다.
// 그래서 admin 클라이언트가 아니라 요청마다 호출자가 넘겨주는 세션 클라이언트를 쓴다.
// 소유자가 아닌 경로에 접근하면 Storage RLS가 막는다.
export async function uploadDraftPhoto(
  supabase: SupabaseClient,
  path: string,
  file: Buffer,
  contentType: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from(DRAFT_PHOTOS_BUCKET)
    .upload(path, file, { contentType, upsert: true });

  if (error) throw error;
}

export async function deleteDraftPhoto(
  supabase: SupabaseClient,
  path: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from(DRAFT_PHOTOS_BUCKET)
    .remove([path]);

  if (error) throw error;
}

// 버킷이 private이므로 매번 만료 시간이 있는 서명된 URL을 발급한다.
export async function getDraftPhotoSignedUrl(
  supabase: SupabaseClient,
  path: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(DRAFT_PHOTOS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRES_IN_SECONDS);

  if (error) throw error;

  return data.signedUrl;
}
