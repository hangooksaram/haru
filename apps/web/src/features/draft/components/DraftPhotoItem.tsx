"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useRef } from "react";

import { DraftPhotoUploader } from "@/features/draft/components/DraftPhotoUploader";
import { removeHyphens } from "@/features/draft/lib/removeHyphens";
import { cn } from "@/lib/utils";

import type { DraftPhoto } from "@/features/draft/types";

type Props = {
  label: string;
  photo: DraftPhoto | null;
  onReplace: (file: File) => void;
  onUpload: (files: File[]) => void;
  isReplacing: boolean;
  uploadDisabled: boolean;
  registerNode: (label: string, node: HTMLElement | null) => void;
};

export function DraftPhotoItem({
  label,
  photo,
  onReplace,
  onUpload,
  isReplacing,
  uploadDisabled,
  registerNode,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const draggable = useDraggable({ id: label, disabled: !photo });
  const droppable = useDroppable({ id: label });

  function setNodeRef(node: HTMLElement | null) {
    draggable.setNodeRef(node);
    droppable.setNodeRef(node);
    registerNode(label, node);
  }

  if (!photo) {
    return (
      <div
        ref={setNodeRef}
        className={cn(
          "relative aspect-square rounded-xl",
          droppable.isOver && "ring-2 ring-primary",
        )}
      >
        <DraftPhotoUploader onSelect={onUpload} disabled={uploadDisabled} />
        <span className="pointer-events-none absolute inset-x-0 top-0 truncate px-2 py-1 text-xs font-medium text-muted-foreground">
          {removeHyphens(label)}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-xl border",
        draggable.isDragging && "opacity-50",
        droppable.isOver && "ring-2 ring-primary",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={removeHyphens(label)}
        className="h-full w-full object-cover"
      />
      <div
        {...draggable.attributes}
        {...draggable.listeners}
        className="absolute inset-x-0 top-0 flex items-center justify-between bg-black/50 px-2 py-1 text-xs font-medium text-white"
      >
        <span className="truncate">{removeHyphens(label)}</span>
        <span className="cursor-grab active:cursor-grabbing">⠿</span>
      </div>
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
