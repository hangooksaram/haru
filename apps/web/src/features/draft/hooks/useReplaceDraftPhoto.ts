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

export function useReplaceDraftPhoto(draftId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      photoId,
      file,
    }: ReplaceDraftPhotoInput): Promise<ReplaceResult> => {
      const processed = await processPhotoFile(file);

      const urlResponse = await fetch(
        `/api/drafts/${draftId}/photos/${photoId}/upload-url`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentType: processed.file.type,
            size: processed.file.size,
          }),
        },
      );
      if (!urlResponse.ok) throw new Error("사진 교체에 실패했습니다.");

      const { path, token } = (await urlResponse.json()) as {
        path: string;
        token: string;
      };

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(DRAFT_PHOTOS_BUCKET)
        .uploadToSignedUrl(path, token, processed.file);
      if (uploadError) throw new Error("사진 교체에 실패했습니다.");

      const confirmResponse = await fetch(
        `/api/drafts/${draftId}/photos/${photoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        },
      );
      if (!confirmResponse.ok) throw new Error("사진 교체에 실패했습니다.");

      const photo = (await confirmResponse.json()) as DraftPhoto;

      return { ...photo, isBlurryWarning: processed.isBlurryWarning };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["draft", draftId] });
    },
  });
}
