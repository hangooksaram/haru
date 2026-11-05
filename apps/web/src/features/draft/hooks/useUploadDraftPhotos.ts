"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DRAFT_PHOTOS_BUCKET } from "@/features/draft/constants";
import { processPhotoFile } from "@/features/draft/lib/processPhotoFile";
import { createClient } from "@/lib/supabase/client";

import type { DraftPhoto } from "@/features/draft/types";

type UploadResult = {
  added: DraftPhoto[];
  rejectedCount: number;
  blurryWarningCount: number;
};

type UploadDraftPhotosInput = {
  label: string;
  files: File[];
};

type UploadSlot = { path: string; token: string; label: string };

export function useUploadDraftPhotos(draftId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      label,
      files,
    }: UploadDraftPhotosInput): Promise<UploadResult> => {
      const processed = await Promise.all(files.map(processPhotoFile));

      const urlResponse = await fetch(
        `/api/drafts/${draftId}/photos/upload-urls`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label,
            files: processed.map(({ file }) => ({
              contentType: file.type,
              size: file.size,
            })),
          }),
        },
      );
      if (!urlResponse.ok) throw new Error("사진 업로드에 실패했습니다.");

      const { uploads, rejectedCount } = (await urlResponse.json()) as {
        uploads: UploadSlot[];
        rejectedCount: number;
      };

      const supabase = createClient();
      const uploadResults = await Promise.all(
        uploads.map(async (slot, index) => {
          const { error } = await supabase.storage
            .from(DRAFT_PHOTOS_BUCKET)
            .uploadToSignedUrl(slot.path, slot.token, processed[index].file);

          return error
            ? null
            : { ...slot, isBlurryWarning: processed[index].isBlurryWarning };
        }),
      );
      const succeeded = uploadResults.filter(
        (item): item is UploadSlot & { isBlurryWarning: boolean } =>
          item !== null,
      );

      const confirmResponse = await fetch(`/api/drafts/${draftId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: succeeded.map(({ path, label }) => ({ path, label })),
        }),
      });
      if (!confirmResponse.ok) throw new Error("사진 업로드에 실패했습니다.");

      const { added } = (await confirmResponse.json()) as {
        added: DraftPhoto[];
      };

      const blurryWarningCount = added.filter(
        (photo) =>
          succeeded.find((item) => item.label === photo.name)?.isBlurryWarning,
      ).length;

      return {
        added,
        rejectedCount: rejectedCount + (uploads.length - succeeded.length),
        blurryWarningCount,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["draft", draftId] });
    },
  });
}
