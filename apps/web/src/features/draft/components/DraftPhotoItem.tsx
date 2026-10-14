"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef } from "react";

import { cn } from "@/lib/utils";

import type { DraftPhoto } from "@/features/draft/types";

type Props = {
  photo: DraftPhoto;
  index: number;
  onReplace: (file: File) => void;
  isReplacing: boolean;
};

export function DraftPhotoItem({
  photo,
  index,
  onReplace,
  isReplacing,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });
  const inputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-xl border",
        isDragging && "opacity-50",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={`사진 ${index + 1}`}
        className="h-full w-full object-cover"
      />
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-x-0 top-0 flex items-center justify-between bg-black/50 px-2 py-1 text-xs font-medium text-white"
      >
        <span>{index + 1}</span>
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
