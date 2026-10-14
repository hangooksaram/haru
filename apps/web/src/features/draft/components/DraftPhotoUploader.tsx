"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  onSelect: (files: File[]) => void;
  disabled: boolean;
};

export function DraftPhotoUploader({ onSelect, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        if (disabled) return;
        event.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragOver(false);
        if (disabled) return;
        const files = Array.from(event.dataTransfer.files);
        if (files.length > 0) onSelect(files);
      }}
      className={cn(
        "text-muted-foreground flex aspect-square items-center justify-center rounded-xl border-2 border-dashed text-sm font-medium transition-colors",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:border-primary hover:text-primary",
        isDragOver && !disabled && "border-primary text-primary bg-primary/5",
      )}
    >
      + 사진 선택
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) onSelect(files);
          event.target.value = "";
        }}
      />
    </button>
  );
}
