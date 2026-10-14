"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { processPhotoFile } from "@/features/draft/lib/processPhotoFile";

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

      const formData = new FormData();
      formData.append("file", processed.file);

      const response = await fetch(`/api/drafts/${draftId}/photos/${photoId}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) throw new Error("사진 교체에 실패했습니다.");

      const photo = (await response.json()) as DraftPhoto;

      return { ...photo, isBlurryWarning: processed.isBlurryWarning };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["draft", draftId] });
    },
  });
}
