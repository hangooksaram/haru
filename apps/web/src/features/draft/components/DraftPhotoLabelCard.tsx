"use client";

import { Eye } from "lucide-react";

import {
  DraftPhotoItem,
  type DraftPhotoSlotStatus,
} from "@/features/draft/components/DraftPhotoItem";
import { removeHyphens } from "@/features/draft/lib/removeHyphens";
import { cn } from "@/lib/utils";

import type { DraftPhoto } from "@/features/draft/types";

export type DraftPhotoLabelCardSlot = {
  name: string;
  caption: string;
  photo: DraftPhoto | null;
  status: DraftPhotoSlotStatus;
  isBlurry?: boolean;
};

type Props = {
  label: string;
  slots: DraftPhotoLabelCardSlot[];
  activeElementName: string | null;
  onUpload: (name: string, files: File[]) => void;
  onReplace: (photoId: string, file: File) => void;
  onSelect: (name: string) => void;
  replacingPhotoId: string | null;
  uploadDisabled: boolean;
  registerNode: (label: string, node: HTMLElement | null) => void;
};

// 정책: 라벨마다 한 줄로 이름과 현황("2/3장")을 보여주고, 그 라벨의 입력을 슬롯으로 나란히 항상 보여준다.
function resolveStatusText(slots: DraftPhotoLabelCardSlot[]): {
  text: string;
  isFailed: boolean;
} {
  if (slots.some((slot) => slot.status === "uploading")) {
    return { text: "업로드 중...", isFailed: false };
  }
  if (slots.some((slot) => slot.status === "failed")) {
    return { text: "업로드에 실패했어요", isFailed: true };
  }

  const filledCount = slots.filter((slot) => slot.photo !== null).length;
  const text =
    slots.length === 1
      ? `${filledCount}/${slots.length}`
      : `${filledCount}/${slots.length}장`;

  return { text, isFailed: false };
}

export function DraftPhotoLabelCard({
  label,
  slots,
  activeElementName,
  onUpload,
  onReplace,
  onSelect,
  replacingPhotoId,
  uploadDisabled,
  registerNode,
}: Props) {
  const status = resolveStatusText(slots);
  const isPreviewing = slots.some((slot) => slot.name === activeElementName);

  return (
    <div className="bg-muted/40 flex items-center justify-start gap-4 rounded-xl p-3">
      <div className="flex min-w-32 shrink-0 flex-col gap-1">
        <span className="text-base font-semibold break-words">
          {removeHyphens(label)}
        </span>
        <span
          className={cn(
            "text-sm",
            status.isFailed ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {status.text}
        </span>
        {isPreviewing && (
          <span className="bg-foreground text-background flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
            <Eye className="h-3 w-3" />
            미리보기 중
          </span>
        )}
      </div>
      <div className="flex flex-wrap justify-start gap-2">
        {slots.map((slot) => (
          <div key={slot.name} className="relative h-20 w-20 shrink-0">
            <DraftPhotoItem
              label={slot.name}
              caption={slot.caption}
              photo={slot.photo}
              status={slot.status}
              isBlurry={slot.isBlurry}
              isReplacing={slot.photo?.id === replacingPhotoId}
              onReplace={(file) => {
                if (slot.photo) onReplace(slot.photo.id, file);
              }}
              onUpload={(files) => onUpload(slot.name, files)}
              onSelect={() => onSelect(slot.name)}
              uploadDisabled={uploadDisabled}
              registerNode={registerNode}
            />
            {slot.name === activeElementName && (
              <span className="bg-primary text-primary-foreground pointer-events-none absolute bottom-[-10px] left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap">
                현재 장면
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
