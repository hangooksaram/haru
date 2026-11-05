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

      // 네트워크 단절 등은 uploadToSignedUrl이 { error }가 아니라 예외로 던지므로,
      // Promise.all을 쓰면 한 장만 실패해도 나머지 성공한 업로드까지 전부 버려진다.
      // allSettled로 각 업로드를 독립적으로 처리해 실패한 것만 걸러낸다.
      const supabase = createClient();
      const uploadSettlements = await Promise.allSettled(
        uploads.map(async (slot, index) => {
          const { error } = await supabase.storage
            .from(DRAFT_PHOTOS_BUCKET)
            .uploadToSignedUrl(slot.path, slot.token, processed[index].file);

          if (error) throw error;

          return { ...slot, isBlurryWarning: processed[index].isBlurryWarning };
        }),
      );
      const succeeded = uploadSettlements
        .filter(
          (
            result,
          ): result is PromiseFulfilledResult<
            UploadSlot & { isBlurryWarning: boolean }
          > => result.status === "fulfilled",
        )
        .map((result) => result.value);

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
