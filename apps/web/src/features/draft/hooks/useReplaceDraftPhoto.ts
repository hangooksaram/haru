"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DRAFT_PHOTOS_BUCKET } from "@/features/draft/constants";
import { processPhotoFile } from "@/features/draft/lib/processPhotoFile";
import { createClient } from "@/lib/supabase/client";

import type { DraftPhoto } from "@/features/draft/types";

type ReplaceDraftPhotoInput = {
  photoId: string;
  file: File;
};

type ReplaceResult = DraftPhoto & { isBlurryWarning: boolean };

async function requestReplaceUploadUrl(
  draftId: string,
  photoId: string,
  file: File,
): Promise<{ path: string; token: string }> {
  const response = await fetch(
    `/api/drafts/${draftId}/photos/${photoId}/upload-url`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentType: file.type,
        size: file.size,
      }),
    },
  );
  if (!response.ok) throw new Error("사진 교체에 실패했습니다.");

  return response.json() as Promise<{ path: string; token: string }>;
}

async function uploadReplacementToStorage(
  path: string,
  token: string,
  file: File,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(DRAFT_PHOTOS_BUCKET)
    .uploadToSignedUrl(path, token, file);
  if (error) throw new Error("사진 교체에 실패했습니다.");
}

async function confirmReplace(
  draftId: string,
  photoId: string,
  path: string,
): Promise<DraftPhoto> {
  const response = await fetch(`/api/drafts/${draftId}/photos/${photoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  if (!response.ok) throw new Error("사진 교체에 실패했습니다.");

  return response.json() as Promise<DraftPhoto>;
}

export function useReplaceDraftPhoto(draftId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      photoId,
      file,
    }: ReplaceDraftPhotoInput): Promise<ReplaceResult> => {
      const processed = await processPhotoFile(file);
      const { path, token } = await requestReplaceUploadUrl(
        draftId,
        photoId,
        processed.file,
      );
      await uploadReplacementToStorage(path, token, processed.file);
      const photo = await confirmReplace(draftId, photoId, path);

      return { ...photo, isBlurryWarning: processed.isBlurryWarning };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["draft", draftId] });
    },
  });
}
