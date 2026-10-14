"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { processPhotoFile } from "@/features/draft/lib/processPhotoFile";

import type { DraftPhoto } from "@/features/draft/types";

type UploadResult = {
  added: DraftPhoto[];
  rejectedCount: number;
  blurryWarningCount: number;
};

export function useUploadDraftPhotos(draftId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]): Promise<UploadResult> => {
      const processed = await Promise.all(files.map(processPhotoFile));

      const formData = new FormData();
      processed.forEach(({ file }) => formData.append("files", file));

      const response = await fetch(`/api/drafts/${draftId}/photos`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("사진 업로드에 실패했습니다.");

      const result = (await response.json()) as {
        added: DraftPhoto[];
        rejectedCount: number;
      };

      const blurryWarningCount = processed
        .slice(0, result.added.length)
        .filter((item) => item.isBlurryWarning).length;

      return { ...result, blurryWarningCount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["draft", draftId] });
    },
  });
}
