"use client";

import { AlertCircle, Plus } from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Variant = "default" | "uploading" | "failed";

type Props = {
  onSelect: (files: File[]) => void;
  disabled: boolean;
  variant?: Variant;
};

const VARIANT_LABEL: Record<Variant, string> = {
  default: "사진 선택",
  uploading: "업로드 중",
  failed: "다시 시도",
};

export function DraftPhotoUploader({
  onSelect,
  disabled,
  variant = "default",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <button
      type="button"
      aria-label={VARIANT_LABEL[variant]}
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
        "absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl text-base font-medium transition-colors",
        variant === "default" &&
          cn(
            "text-muted-foreground border-2 border-dashed",
            disabled
              ? "cursor-not-allowed opacity-50"
              : "hover:border-primary hover:text-primary",
            isDragOver &&
              !disabled &&
              "border-primary text-primary bg-primary/5",
          ),
        variant === "uploading" &&
          "bg-muted text-muted-foreground cursor-not-allowed text-sm",
        variant === "failed" &&
          "border-destructive bg-destructive/5 text-destructive border-2 text-sm",
      )}
    >
      {variant === "default" && <Plus className="h-5 w-5" aria-hidden="true" />}
      {variant === "failed" && (
        <>
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {VARIANT_LABEL.failed}
        </>
      )}
      {variant === "uploading" && "업로드 중..."}
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
