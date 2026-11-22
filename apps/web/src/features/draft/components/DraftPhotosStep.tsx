"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { DraftStepNav } from "@/components/DraftStepNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { DraftPhotoGrid } from "@/features/draft/components/DraftPhotoGrid";
import { DraftPreviewPanel } from "@/features/draft/components/DraftPreviewPanel";
import { useCreateDraft } from "@/features/draft/hooks/useCreateDraft";
import { useDraft } from "@/features/draft/hooks/useDraft";
import { useDraftPreview } from "@/features/draft/hooks/useDraftPreview";
import { useReplaceDraftPhoto } from "@/features/draft/hooks/useReplaceDraftPhoto";
import { useSwapDraftPhotos } from "@/features/draft/hooks/useSwapDraftPhotos";
import { useUploadDraftPhotos } from "@/features/draft/hooks/useUploadDraftPhotos";
import { groupPhotoLabels } from "@/features/draft/lib/groupPhotoLabels";
import { useTemplatePhotoElements } from "@/features/template/hooks/useTemplatePhotoElements";

import type { DraftPhotoGroup } from "@/features/draft/components/DraftPhotoGrid";
import type { DraftPhotoSlotStatus } from "@/features/draft/components/DraftPhotoItem";
import type { DraftPhoto, DraftSavedText } from "@/features/draft/types";
import type { CSSProperties } from "react";

const EMPTY_PHOTOS: DraftPhoto[] = [];
const EMPTY_TEXTS: DraftSavedText[] = [];

type Props = {
  templateId: string;
  prevHref: string;
  nextHref: string;
  showPreviewShortcut?: boolean;
};

export function DraftPhotosStep({
  templateId,
  prevHref,
  nextHref,
  showPreviewShortcut,
}: Props) {
  const router = useRouter();
  const { draftId, setDraftId } = useDraftId();
  const { mutate: createDraft } = useCreateDraft();
  const { data: draft, isLoading: isDraftLoading } = useDraft(draftId ?? null);
  const { data: labels, isLoading: isLabelsLoading } =
    useTemplatePhotoElements(templateId);
  const [message, setMessage] = useState<string | null>(null);
  const [navError, setNavError] = useState<string | null>(null);
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);
  const [uploadingLabels, setUploadingLabels] = useState<Set<string>>(
    new Set(),
  );
  const [failedLabels, setFailedLabels] = useState<Set<string>>(new Set());
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const pendingUploadLabelsRef = useRef<string[]>([]);
  const [isDraggingFileOverWindow, setIsDraggingFileOverWindow] =
    useState(false);
  const windowDragCounterRef = useRef(0);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  const upload = useUploadDraftPhotos(draftId ?? "");
  const replace = useReplaceDraftPhoto(draftId ?? "");
  const swap = useSwapDraftPhotos(draftId ?? "");

  const {
    containerRef: previewContainerRef,
    isLoading: isPreviewLoading,
    isBuffering: isPreviewBuffering,
    error: previewError,
    activeElementName,
    selectElement,
    replay,
    isPlayingAll,
    toggleAll,
    playbackProgress,
  } = useDraftPreview({
    templateId,
    photos: draft?.photos ?? EMPTY_PHOTOS,
    texts: draft?.texts ?? EMPTY_TEXTS,
  });

  const hasRequestedDraft = useRef(false);

  useEffect(() => {
    if (draftId === undefined || draftId) return;
    if (hasRequestedDraft.current) return;
    hasRequestedDraft.current = true;
    createDraft(templateId, {
      onSuccess: (created) => setDraftId(created.id),
      onError: () => {
        hasRequestedDraft.current = false;
      },
    });
  }, [draftId, templateId, createDraft, setDraftId]);

  // 화면 전체에 파일을 놓으면 빈 라벨부터 순서대로 채운다. 드래그 중에만 안내를 보여준다.
  useEffect(() => {
    function hasFiles(event: globalThis.DragEvent) {
      return Array.from(event.dataTransfer?.types ?? []).includes("Files");
    }

    function handleWindowDragEnter(event: globalThis.DragEvent) {
      if (!hasFiles(event)) return;
      windowDragCounterRef.current += 1;
      setIsDraggingFileOverWindow(true);
    }

    function handleWindowDragOver(event: globalThis.DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();
    }

    function handleWindowDragLeave(event: globalThis.DragEvent) {
      if (!hasFiles(event)) return;
      windowDragCounterRef.current = Math.max(
        0,
        windowDragCounterRef.current - 1,
      );
      if (windowDragCounterRef.current === 0)
        setIsDraggingFileOverWindow(false);
    }

    function handleWindowDrop(event: globalThis.DragEvent) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      windowDragCounterRef.current = 0;
      setIsDraggingFileOverWindow(false);
      if (!draftId) return;

      const files = Array.from(event.dataTransfer?.files ?? []);
      if (files.length > 0) handleUpload(undefined, files);
    }

    window.addEventListener("dragenter", handleWindowDragEnter);
    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("dragleave", handleWindowDragLeave);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragenter", handleWindowDragEnter);
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("dragleave", handleWindowDragLeave);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, [draftId]);

  if (!draftId || isDraftLoading || isLabelsLoading || !draft || !labels) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-16" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const photoCount = draft.photos.length;
  const labelCount = labels.length;

  function clearPendingLabels(labelsToClear: string[]) {
    setUploadingLabels((prev) => {
      const next = new Set(prev);
      labelsToClear.forEach((name) => next.delete(name));
      return next;
    });
  }

  function handleUpload(label: string | undefined, files: File[]) {
    setMessage(null);
    pendingUploadLabelsRef.current = [];
    upload.mutate(
      {
        label,
        files,
        onLabelsAssigned: (assigned) => {
          pendingUploadLabelsRef.current = assigned;
          setUploadingLabels((prev) => new Set([...prev, ...assigned]));
          setFailedLabels((prev) => {
            const next = new Set(prev);
            assigned.forEach((name) => next.delete(name));
            return next;
          });
        },
      },
      {
        onSuccess: (result) => {
          clearPendingLabels(pendingUploadLabelsRef.current);
          setFailedLabels((prev) => new Set([...prev, ...result.failedLabels]));

          const notes: string[] = [];
          if (result.rejectedCount > 0) {
            notes.push(
              `${result.rejectedCount}장은 남은 자리가 없어 올리지 못했습니다.`,
            );
          }
          if (result.failedLabels.length > 0) {
            notes.push(
              `${result.failedLabels.length}장은 업로드에 실패했습니다. 다시 시도해 주세요.`,
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
          clearPendingLabels(pendingUploadLabelsRef.current);
          setFailedLabels(
            (prev) => new Set([...prev, ...pendingUploadLabelsRef.current]),
          );
          setMessage(
            error instanceof Error ? error.message : "업로드에 실패했습니다.",
          );
        },
      },
    );
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

  function validatePhotoCount(): boolean {
    setNavError(null);

    if (photoCount < labelCount) {
      setNavError("사진을 모두 업로드해 주세요.");

      return false;
    }

    return true;
  }

  async function handleNext(): Promise<boolean> {
    return validatePhotoCount();
  }

  function handleGoToPreview() {
    if (!validatePhotoCount()) return;

    router.push(`/draft/${templateId}/preview`);
  }

  const photoByLabel = new Map(
    draft.photos.map((photo) => [photo.name, photo]),
  );
  const labelGroups = groupPhotoLabels(labels);
  const groups: DraftPhotoGroup[] = labelGroups.map((group) => ({
    label: group.label,
    slots: group.slotNames.map((name) => {
      const status: DraftPhotoSlotStatus = uploadingLabels.has(name)
        ? "uploading"
        : failedLabels.has(name)
          ? "failed"
          : "empty";

      return { name, photo: photoByLabel.get(name) ?? null, status };
    }),
  }));
  const segments = groups.flatMap((group) =>
    group.slots.map((slot) => ({
      name: slot.name,
      filled: slot.photo !== null,
    })),
  );

  return (
    <div className="flex flex-col gap-4">
      <DraftStepNav
        prevHref={prevHref}
        nextHref={nextHref}
        onNext={handleNext}
        extra={
          showPreviewShortcut ? (
            <Button variant="outline" size="lg" onClick={handleGoToPreview}>
              미리보기로 이동
            </Button>
          ) : undefined
        }
      />

      <div
        className="grid gap-6 md:items-start md:[grid-template-columns:var(--preview-cols)] md:transition-[grid-template-columns] md:duration-[380ms] md:ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={
          {
            "--preview-cols": isPreviewCollapsed ? "1fr 0fr" : "6fr 4fr",
          } as CSSProperties
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4 rounded-xl border p-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-primary text-2xl font-bold tabular-nums">
                {photoCount}장
              </span>
              <span className="text-sm font-medium">완료</span>
              <span className="text-muted-foreground text-sm">
                / 전체 {labelCount}장
              </span>
            </div>
            <div className="flex min-w-[160px] flex-1 flex-col gap-1.5">
              <div
                role="progressbar"
                aria-label="사진 입력 진행"
                aria-valuemin={0}
                aria-valuemax={labelCount}
                aria-valuenow={photoCount}
                className="bg-muted h-2 overflow-hidden rounded-full"
              >
                <div
                  className="bg-primary h-full rounded-full transition-[width]"
                  style={{
                    width: `${labelCount > 0 ? (photoCount / labelCount) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-muted-foreground text-sm">
                남은 사진{" "}
                <strong className="text-foreground">
                  {Math.max(0, labelCount - photoCount)}장
                </strong>
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={upload.isPending}
              onClick={() => batchFileInputRef.current?.click()}
            >
              한꺼번에 올리기
            </Button>
            <input
              ref={batchFileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                if (files.length > 0) handleUpload(undefined, files);
                event.target.value = "";
              }}
            />
          </div>
          {message && (
            <p className="text-sm font-medium text-amber-600">{message}</p>
          )}
          {navError && (
            <p className="text-destructive text-sm font-medium">{navError}</p>
          )}
          <DraftPhotoGrid
            groups={groups}
            activeElementName={activeElementName}
            onSwap={handleSwap}
            onUpload={handleUpload}
            onReplace={handleReplace}
            onSelect={selectElement}
            replacingPhotoId={replacingPhotoId}
            uploadDisabled={upload.isPending}
          />
        </div>

        <div className="hidden min-w-0 md:block">
          <div className="md:sticky md:top-20">
            <DraftPreviewPanel
              containerRef={previewContainerRef}
              isLoading={isPreviewLoading}
              isBuffering={isPreviewBuffering}
              error={previewError}
              activeElementName={activeElementName}
              segments={segments}
              onReplay={replay}
              isPlayingAll={isPlayingAll}
              onToggleAll={toggleAll}
              playbackProgress={playbackProgress}
              onCollapsedChange={setIsPreviewCollapsed}
            />
          </div>
        </div>
      </div>

      {isDraggingFileOverWindow && (
        <div className="bg-primary/10 pointer-events-none fixed inset-0 z-50 hidden items-center justify-center md:flex">
          <p className="bg-background rounded-lg px-6 py-4 text-lg font-medium shadow-lg">
            화면에 놓아서 한꺼번에 업로드
          </p>
        </div>
      )}
    </div>
  );
}
