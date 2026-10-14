"use client";

import { useState } from "react";

import { DraftPhotoGrid } from "@/features/draft/components/DraftPhotoGrid";
import { DraftPhotoUploader } from "@/features/draft/components/DraftPhotoUploader";
import { useDraft } from "@/features/draft/hooks/useDraft";
import { useDraftId } from "@/features/draft/hooks/useDraftId";
import { useReorderDraftPhotos } from "@/features/draft/hooks/useReorderDraftPhotos";
import { useReplaceDraftPhoto } from "@/features/draft/hooks/useReplaceDraftPhoto";
import { useUploadDraftPhotos } from "@/features/draft/hooks/useUploadDraftPhotos";

type Props = {
  templateId: string;
};

export function DraftPhotosStep({ templateId }: Props) {
  const { draftId } = useDraftId(templateId);
  const { data: draft, isLoading } = useDraft(draftId);
  const [message, setMessage] = useState<string | null>(null);
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);

  const upload = useUploadDraftPhotos(draftId ?? "");
  const replace = useReplaceDraftPhoto(draftId ?? "");
  const reorder = useReorderDraftPhotos(draftId ?? "");

  if (!draftId || isLoading || !draft) {
    return <p className="text-muted-foreground">불러오는 중...</p>;
  }

  const remaining = draft.photoSlotCount - draft.photos.length;

  function handleSelect(files: File[]) {
    setMessage(null);
    upload.mutate(files, {
      onSuccess: (result) => {
        const notes: string[] = [];
        if (result.rejectedCount > 0) {
          notes.push(
            `${result.rejectedCount}장은 남은 자리가 없어 올리지 못했습니다.`,
          );
        }
        if (result.blurryWarningCount > 0) {
          notes.push(
            `${result.blurryWarningCount}장은 해상도가 낮아 화질이 흐릴 수 있습니다.`,
          );
        }
        if (notes.length > 0) setMessage(notes.join(" "));
      },
      onError: (error) => {
        setMessage(
          error instanceof Error ? error.message : "업로드에 실패했습니다.",
        );
      },
    });
  }

  function handleReplace(photoId: string, file: File) {
    setMessage(null);
    setReplacingPhotoId(photoId);
    replace.mutate(
      { photoId, file },
      {
        onSuccess: (result) => {
          if (result.isBlurryWarning) {
            setMessage("해상도가 낮아 화질이 흐릴 수 있습니다.");
          }
        },
        onError: (error) => {
          setMessage(
            error instanceof Error
              ? error.message
              : "사진 교체에 실패했습니다.",
          );
        },
        onSettled: () => setReplacingPhotoId(null),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        {draft.photos.length} / {draft.photoSlotCount}장
      </p>
      {message && (
        <p className="text-sm font-medium text-amber-600">{message}</p>
      )}
      <DraftPhotoGrid
        photos={draft.photos}
        onReorder={(photoIds) => reorder.mutate(photoIds)}
        onReplace={handleReplace}
        replacingPhotoId={replacingPhotoId}
        trailing={
          remaining > 0 && (
            <DraftPhotoUploader
              onSelect={handleSelect}
              disabled={upload.isPending}
            />
          )
        }
      />
    </div>
  );
}
