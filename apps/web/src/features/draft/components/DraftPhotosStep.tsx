"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { DraftStepBar } from "@/components/DraftStepBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { DraftPhotoGrid } from "@/features/draft/components/DraftPhotoGrid";
import {
  DraftEditorBody,
  DraftEditorHeader,
} from "@/features/draft/components/DraftEditorShell";
import {
  DraftPreviewBinding,
  useDraftPreviewContext,
} from "@/features/draft/components/DraftPreviewProvider";
import { useDraft } from "@/features/draft/hooks/useDraft";
import { useRequireBasicInfo } from "@/features/draft/hooks/useRequireBasicInfo";
import { useReplaceDraftPhoto } from "@/features/draft/hooks/useReplaceDraftPhoto";
import { useSwapDraftPhotos } from "@/features/draft/hooks/useSwapDraftPhotos";
import { useUploadDraftPhotos } from "@/features/draft/hooks/useUploadDraftPhotos";
import { groupPhotoLabels } from "@/features/draft/lib/groupPhotoLabels";
import { useTemplate } from "@/features/template/hooks/useTemplate";
import { useTemplatePhotoElements } from "@/features/template/hooks/useTemplatePhotoElements";

import type { DraftPhotoGroup } from "@/features/draft/components/DraftPhotoGrid";
import type { DraftPhotoSlotStatus } from "@/features/draft/components/DraftPhotoItem";

type Props = {
  templateId: string;
  prevHref: string;
  nextHref: string;
  returnToPayment?: boolean;
};

export function DraftPhotosStep({
  templateId,
  prevHref,
  nextHref,
  returnToPayment,
}: Props) {
  const router = useRouter();
  const { draftId } = useDraftId();
  const { data: draft, isLoading: isDraftLoading } = useDraft(draftId ?? null);
  const { data: template } = useTemplate(templateId);
  const { data: labels, isLoading: isLabelsLoading } =
    useTemplatePhotoElements(templateId);
  const [message, setMessage] = useState<string | null>(null);
  const [highlightSlotName, setHighlightSlotName] = useState<string | null>(
    null,
  );
  const [highlightToken, setHighlightToken] = useState(0);
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);
  const [uploadingLabels, setUploadingLabels] = useState<Set<string>>(
    new Set(),
  );
  const [failedLabels, setFailedLabels] = useState<Set<string>>(new Set());
  // 저화질 경고는 서버에 저장하지 않으므로 이번 방문에서 올린 사진에만 표시한다.
  const [blurryLabels, setBlurryLabels] = useState<Set<string>>(new Set());
  const pendingUploadLabelsRef = useRef<string[]>([]);
  const [isDraggingFileOverWindow, setIsDraggingFileOverWindow] =
    useState(false);
  const windowDragCounterRef = useRef(0);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  const upload = useUploadDraftPhotos(draftId ?? "");
  const replace = useReplaceDraftPhoto(draftId ?? "");
  const swap = useSwapDraftPhotos(draftId ?? "");

  const { activeElementName, selectElement } = useDraftPreviewContext();

  useRequireBasicInfo(templateId);

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
      <DraftEditorBody className="gap-4">
        <Skeleton className="h-5 w-16" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      </DraftEditorBody>
    );
  }

  const photoCount = draft.photos.length;
  const labelCount = labels.length;

  function markBlurry(labelsToMark: string[], isBlurry: boolean) {
    setBlurryLabels((prev) => {
      const next = new Set(prev);
      labelsToMark.forEach((name) =>
        isBlurry ? next.add(name) : next.delete(name),
      );
      return next;
    });
  }

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
          markBlurry(
            result.added.map((photo) => photo.name),
            false,
          );
          markBlurry(result.blurryLabels, true);

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
          if (result.blurryLabels.length > 0) {
            notes.push(
              `${result.blurryLabels.length}장은 해상도가 낮아 화질이 흐릴 수 있습니다. (저화질 표시)`,
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
          markBlurry([result.name], result.isBlurryWarning);
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
    setBlurryLabels((prev) => {
      const next = new Set(prev);
      next.delete(from);
      next.delete(to);
      if (prev.has(from)) next.add(to);
      if (prev.has(to)) next.add(from);
      return next;
    });
    swap.mutate({ from, to });
  }

  function validatePhotoCount(): boolean {
    if (photoCount < labelCount) {
      toast.error("사진을 모두 업로드해 주세요.");

      const firstEmpty = segments.find((segment) => !segment.filled)?.name;
      if (firstEmpty) {
        setHighlightSlotName(firstEmpty);
        setHighlightToken((token) => token + 1);
      }

      return false;
    }

    return true;
  }

  function handlePrimaryClick() {
    if (!validatePhotoCount()) return;

    router.push(returnToPayment ? `/draft/${templateId}/payment` : nextHref);
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

      return {
        name,
        photo: photoByLabel.get(name) ?? null,
        status,
        isBlurry: blurryLabels.has(name),
      };
    }),
  }));
  const segments = groups.flatMap((group) =>
    group.slots.map((slot) => ({
      name: slot.name,
      filled: slot.photo !== null,
    })),
  );

  const remainingCount = labelCount - photoCount;

  return (
    <>
      <DraftEditorHeader>
        <DraftStepBar
          current={1}
          templateId={templateId}
          templateName={template?.name ?? ""}
          prevHref={prevHref}
          primaryLabel={returnToPayment ? "결제로 돌아가기" : "다음: 자막 입력"}
          onPrimaryClick={handlePrimaryClick}
          remainingLabel={
            remainingCount > 0 ? `${remainingCount}장 남음` : undefined
          }
        />
      </DraftEditorHeader>

      <DraftEditorBody className="gap-4">
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
            variant={photoCount === 0 ? "default" : "outline"}
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
        <p className="text-muted-foreground text-xs">
          사진은 올리는 즉시 저장돼요.
        </p>
        {message && (
          <p className="text-sm font-medium text-amber-600">{message}</p>
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
          highlightSlotName={highlightSlotName}
          highlightToken={highlightToken}
        />
      </DraftEditorBody>

      <DraftPreviewBinding segments={segments} />

      {isDraggingFileOverWindow && (
        <div className="bg-primary/10 pointer-events-none fixed inset-0 z-50 hidden items-center justify-center md:flex">
          <p className="bg-background rounded-lg px-6 py-4 text-lg font-medium shadow-lg">
            화면에 놓아서 한꺼번에 업로드
          </p>
        </div>
      )}
    </>
  );
}
