"use client";

import { useEffect, useState } from "react";

import { DraftStepNav } from "@/components/DraftStepNav";
import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { DraftPhotoGrid } from "@/features/draft/components/DraftPhotoGrid";
import { DraftForbiddenError } from "@/features/draft/errors";
import { useCreateDraft } from "@/features/draft/hooks/useCreateDraft";
import { useDraft } from "@/features/draft/hooks/useDraft";
import { useReplaceDraftPhoto } from "@/features/draft/hooks/useReplaceDraftPhoto";
import { useSwapDraftPhotos } from "@/features/draft/hooks/useSwapDraftPhotos";
import { useUploadDraftPhotos } from "@/features/draft/hooks/useUploadDraftPhotos";
import { useTemplatePhotoElements } from "@/features/template/hooks/useTemplatePhotoElements";

type Props = {
  templateId: string;
  prevHref: string;
  nextHref: string;
};

export function DraftPhotosStep({ templateId, prevHref, nextHref }: Props) {
  const { draftId, setDraftId, clearDraftId } = useDraftId();
  const { mutate: createDraft } = useCreateDraft();
  const {
    data: draft,
    isLoading: isDraftLoading,
    error,
  } = useDraft(draftId ?? null);
  const { data: labels, isLoading: isLabelsLoading } =
    useTemplatePhotoElements(templateId);
  const [message, setMessage] = useState<string | null>(null);
  const [navError, setNavError] = useState<string | null>(null);
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(
    null,
  );

  const upload = useUploadDraftPhotos(draftId ?? "");
  const replace = useReplaceDraftPhoto(draftId ?? "");
  const swap = useSwapDraftPhotos(draftId ?? "");

  useEffect(() => {
    if (draftId === undefined || draftId) return;
    createDraft(templateId, {
      onSuccess: (created) => setDraftId(created.id),
    });
  }, [draftId, templateId, createDraft, setDraftId]);

  // 소유자가 아닌 시안을 조회하다 403을 받으면 이어하기를 노출하지 않고, 저장된 draftId를 지워 새 시안을 생성한다.
  useEffect(() => {
    if (error instanceof DraftForbiddenError) clearDraftId();
  }, [error, clearDraftId]);

  if (!draftId || isDraftLoading || isLabelsLoading || !draft || !labels) {
    return <p className="text-muted-foreground">불러오는 중...</p>;
  }

  const photoCount = draft.photos.length;
  const labelCount = labels.length;

  function handleUpload(label: string, files: File[]) {
    setMessage(null);
    upload.mutate({ label, files }, {
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

  function handleSwap(from: string, to: string) {
    setMessage(null);
    swap.mutate({ from, to });
  }

  async function handleNext(): Promise<boolean> {
    setNavError(null);

    if (photoCount < labelCount) {
      setNavError("사진을 모두 업로드해 주세요.");

      return false;
    }

    return true;
  }

  const photoByLabel = new Map(
    draft.photos.map((photo) => [photo.name, photo]),
  );
  const slots = labels.map((label) => ({
    label,
    photo: photoByLabel.get(label) ?? null,
  }));

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        {photoCount} / {labelCount}장
      </p>
      {message && (
        <p className="text-sm font-medium text-amber-600">{message}</p>
      )}
      {navError && (
        <p className="text-destructive text-sm font-medium">{navError}</p>
      )}
      <DraftPhotoGrid
        slots={slots}
        onSwap={handleSwap}
        onUpload={handleUpload}
        onReplace={handleReplace}
        replacingPhotoId={replacingPhotoId}
        uploadDisabled={upload.isPending}
      />
      <DraftStepNav
        prevHref={prevHref}
        nextHref={nextHref}
        onNext={handleNext}
      />
    </div>
  );
}
