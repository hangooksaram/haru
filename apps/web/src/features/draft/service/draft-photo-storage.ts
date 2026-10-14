import { getSupabaseAdminClient } from "@/lib/supabase";

const DRAFT_PHOTOS_BUCKET = "draft-photos";
const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60;

export async function uploadDraftPhoto(
  path: string,
  file: Buffer,
  contentType: string,
): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .storage.from(DRAFT_PHOTOS_BUCKET)
    .upload(path, file, { contentType, upsert: true });

  if (error) throw error;
}

export async function deleteDraftPhoto(path: string): Promise<void> {
  const { error } = await getSupabaseAdminClient()
    .storage.from(DRAFT_PHOTOS_BUCKET)
    .remove([path]);

  if (error) throw error;
}

// 버킷이 private이므로 매번 만료 시간이 있는 서명된 URL을 발급한다.
export async function getDraftPhotoSignedUrl(path: string): Promise<string> {
  const { data, error } = await getSupabaseAdminClient()
    .storage.from(DRAFT_PHOTOS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRES_IN_SECONDS);

  if (error) throw error;

  return data.signedUrl;
}
