"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { DRAFT_PHOTOS_BUCKET } from "@/features/draft/constants";
import { processPhotoFile } from "@/features/draft/lib/processPhotoFile";
import { createClient } from "@/lib/supabase/client";

import type { Draft, DraftPhoto } from "@/features/draft/types";

type UploadResult = {
  added: DraftPhoto[];
  rejectedCount: number;
  blurryLabels: string[];
  failedLabels: string[];
};

type UploadDraftPhotosInput = {
  // label 없이 올리면(화면 전체 드랍, 한꺼번에 올리기) 빈 라벨부터 템플릿 순서대로 채운다.
  label?: string;
  files: File[];
  onLabelsAssigned?: (labels: string[]) => void;
};

type UploadSlot = { path: string; token: string; label: string };
type ProcessedPhoto = { file: File; isBlurryWarning: boolean };
type UploadedSlot = UploadSlot & { isBlurryWarning: boolean };

async function requestUploadUrls(
  draftId: string,
  label: string | undefined,
  processed: ProcessedPhoto[],
): Promise<{ uploads: UploadSlot[]; rejectedCount: number }> {
  const response = await fetch(`/api/drafts/${draftId}/photos/upload-urls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      label,
      files: processed.map(({ file }) => ({
        contentType: file.type,
        size: file.size,
      })),
    }),
  });
  if (!response.ok) throw new Error("사진 업로드에 실패했습니다.");

  return response.json() as Promise<{
    uploads: UploadSlot[];
    rejectedCount: number;
  }>;
}

// 네트워크 단절 등은 uploadToSignedUrl이 { error }가 아니라 예외로 던지므로,
// Promise.all을 쓰면 한 장만 실패해도 나머지 성공한 업로드까지 전부 버려진다.
// allSettled로 각 업로드를 독립적으로 처리해 실패한 것만 걸러낸다.
async function uploadToStorage(
  uploads: UploadSlot[],
  processed: ProcessedPhoto[],
): Promise<{ succeeded: UploadedSlot[]; failedLabels: string[] }> {
  const supabase = createClient();
  const settlements = await Promise.allSettled(
    uploads.map(async (slot, index) => {
      const { error } = await supabase.storage
        .from(DRAFT_PHOTOS_BUCKET)
        .uploadToSignedUrl(slot.path, slot.token, processed[index].file);

      if (error) throw error;

      return { ...slot, isBlurryWarning: processed[index].isBlurryWarning };
    }),
  );

  const succeeded: UploadedSlot[] = [];
  const failedLabels: string[] = [];

  settlements.forEach((result, index) => {
    if (result.status === "fulfilled") succeeded.push(result.value);
    else failedLabels.push(uploads[index].label);
  });

  return { succeeded, failedLabels };
}

async function confirmUploads(
  draftId: string,
  succeeded: UploadedSlot[],
): Promise<DraftPhoto[]> {
  const response = await fetch(`/api/drafts/${draftId}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: succeeded.map(({ path, label }) => ({ path, label })),
    }),
  });
  if (!response.ok) throw new Error("사진 업로드에 실패했습니다.");

  const { added } = (await response.json()) as { added: DraftPhoto[] };
  return added;
}

function findBlurryLabels(
  added: DraftPhoto[],
  succeeded: UploadedSlot[],
): string[] {
  return added
    .filter(
      (photo) =>
        succeeded.find((item) => item.label === photo.name)?.isBlurryWarning,
    )
    .map((photo) => photo.name);
}

export function useUploadDraftPhotos(draftId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      label,
      files,
      onLabelsAssigned,
    }: UploadDraftPhotosInput): Promise<UploadResult> => {
      const processed = await Promise.all(files.map(processPhotoFile));
      const { uploads, rejectedCount } = await requestUploadUrls(
        draftId,
        label,
        processed,
      );
      onLabelsAssigned?.(uploads.map((upload) => upload.label));
      const { succeeded, failedLabels } = await uploadToStorage(
        uploads,
        processed,
      );
      const added = await confirmUploads(draftId, succeeded);

      return {
        added,
        rejectedCount,
        blurryLabels: findBlurryLabels(added, succeeded),
        failedLabels,
      };
    },
    onSuccess: (result) => {
      queryClient.setQueryData<Draft>(["draft", draftId], (previous) =>
        previous
          ? { ...previous, photos: [...previous.photos, ...result.added] }
          : previous,
      );
    },
  });
}
