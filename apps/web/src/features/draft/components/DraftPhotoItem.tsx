"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CheckCircle2 } from "lucide-react";
import { useRef } from "react";

import { DraftPhotoUploader } from "@/features/draft/components/DraftPhotoUploader";
import { removeHyphens } from "@/features/draft/lib/removeHyphens";
import { cn } from "@/lib/utils";

import type { DraftPhoto } from "@/features/draft/types";

export type DraftPhotoSlotStatus = "empty" | "uploading" | "failed";

type Props = {
  label: string;
  caption?: string;
  photo: DraftPhoto | null;
  status: DraftPhotoSlotStatus;
  isBlurry?: boolean;
  onReplace: (file: File) => void;
  onUpload: (files: File[]) => void;
  onSelect: () => void;
  isReplacing: boolean;
  uploadDisabled: boolean;
  registerNode: (label: string, node: HTMLElement | null) => void;
};

export function DraftPhotoItem({
  label,
  caption,
  photo,
  status,
  isBlurry,
  onReplace,
  onUpload,
  onSelect,
  isReplacing,
  uploadDisabled,
  registerNode,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const draggable = useDraggable({ id: label, disabled: !photo });
  const droppable = useDroppable({ id: label });
  const displayCaption = caption ?? removeHyphens(label);

  function setNodeRef(node: HTMLElement | null) {
    draggable.setNodeRef(node);
    droppable.setNodeRef(node);
    registerNode(label, node);
  }

  if (!photo) {
    return (
      <div
        ref={setNodeRef}
        onClick={onSelect}
        className={cn(
          "relative aspect-square rounded-xl",
          droppable.isOver && "ring-2 ring-primary",
        )}
      >
        <DraftPhotoUploader
          onSelect={onUpload}
          disabled={uploadDisabled || status === "uploading"}
          variant={
            status === "uploading"
              ? "uploading"
              : status === "failed"
                ? "failed"
                : "default"
          }
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-xl border",
        draggable.isDragging && "opacity-50",
        droppable.isOver && "ring-2 ring-primary",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={displayCaption}
        className="h-full w-full object-cover"
      />
      <div
        {...draggable.attributes}
        {...draggable.listeners}
        className="absolute inset-x-0 top-0 flex h-6 cursor-grab items-center justify-center bg-black/50 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        ⠿
      </div>
      {isBlurry && (
        <span
          title="해상도가 낮아 화질이 흐릴 수 있습니다."
          className="absolute top-1 left-1 rounded bg-amber-500 px-1 py-0.5 text-[10px] leading-none font-bold text-white"
        >
          저화질
        </span>
      )}
      <CheckCircle2
        className="absolute right-1 bottom-1 h-5 w-5 rounded-full bg-emerald-500 text-white"
        aria-hidden="true"
      />
      <button
        type="button"
        disabled={isReplacing}
        onClick={() => inputRef.current?.click()}
        className="absolute inset-x-0 bottom-0 bg-black/60 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
      >
        {isReplacing ? "교체 중..." : "다시 올리기"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onReplace(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
