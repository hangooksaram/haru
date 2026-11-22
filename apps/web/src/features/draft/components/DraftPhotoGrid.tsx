"use client";

import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";

import { type DraftPhotoSlotStatus } from "@/features/draft/components/DraftPhotoItem";
import { DraftPhotoLabelCard } from "@/features/draft/components/DraftPhotoLabelCard";
import { firstEmptySlotName } from "@/features/draft/lib/firstEmptySlotName";
import { removeHyphens } from "@/features/draft/lib/removeHyphens";
import { cn } from "@/lib/utils";

import type { DraftPhoto } from "@/features/draft/types";
import type { DragEvent } from "react";

export type DraftPhotoGroup = {
  label: string;
  slots: {
    name: string;
    photo: DraftPhoto | null;
    status: DraftPhotoSlotStatus;
  }[];
};

type Props = {
  groups: DraftPhotoGroup[];
  activeElementName: string | null;
  onSwap: (from: string, to: string) => void;
  onUpload: (label: string, files: File[]) => void;
  onReplace: (photoId: string, file: File) => void;
  onSelect: (label: string) => void;
  replacingPhotoId: string | null;
  uploadDisabled: boolean;
  highlightSlotName?: string | null;
  highlightToken?: number;
};

export function DraftPhotoGrid({
  groups,
  activeElementName,
  onSwap,
  onUpload,
  onReplace,
  onSelect,
  replacingPhotoId,
  uploadDisabled,
  highlightSlotName,
  highlightToken,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [activeSize, setActiveSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [dragOverGroupLabel, setDragOverGroupLabel] = useState<string | null>(
    null,
  );
  const allSlots = groups.flatMap((group) => group.slots);
  const activePhoto =
    allSlots.find((slot) => slot.name === activeLabel)?.photo ?? null;
  const nodesRef = useRef(new Map<string, HTMLElement>());

  // 필수 항목이 남은 채로 다음 단계 버튼을 누르면 첫 빈 슬롯으로 스크롤해 잠깐 강조한다.
  useEffect(() => {
    if (!highlightSlotName) return;

    const node = nodesRef.current.get(highlightSlotName);
    if (!node) return;

    node.scrollIntoView?.({ behavior: "smooth", block: "center" });
    node.classList.add("ring-2", "ring-destructive", "ring-offset-2");

    const timer = setTimeout(() => {
      node.classList.remove("ring-2", "ring-destructive", "ring-offset-2");
    }, 1600);

    return () => clearTimeout(timer);
  }, [highlightSlotName, highlightToken]);

  function registerNode(label: string, node: HTMLElement | null) {
    if (node) nodesRef.current.set(label, node);
    else nodesRef.current.delete(label);
  }

  function handleDragStart(event: DragStartEvent) {
    const label = String(event.active.id);
    setActiveLabel(label);

    const rect = nodesRef.current.get(label)?.getBoundingClientRect();
    setActiveSize(rect ? { width: rect.width, height: rect.height } : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveLabel(null);
    setActiveSize(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    onSwap(String(active.id), String(over.id));
  }

  // 슬롯 자체의 드롭(DraftPhotoUploader)이 이미 처리했으면 defaultPrevented가 true이므로 건너뛴다.
  function handleGroupDrop(group: DraftPhotoGroup, event: DragEvent) {
    setDragOverGroupLabel(null);
    if (event.defaultPrevented || uploadDisabled) return;

    const targetSlot = firstEmptySlotName(group.slots);
    if (!targetSlot) return;

    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) onUpload(targetSlot, files);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveLabel(null);
        setActiveSize(null);
      }}
    >
      <div className="flex flex-col gap-3">
        {groups.map((group) => {
          const hasEmptySlot = firstEmptySlotName(group.slots) !== undefined;

          return (
            <div
              key={group.label}
              className={cn(
                "rounded-xl transition-shadow",
                dragOverGroupLabel === group.label && "ring-2 ring-primary",
              )}
              onDragOver={(event) => {
                if (event.defaultPrevented || uploadDisabled || !hasEmptySlot)
                  return;
                event.preventDefault();
                setDragOverGroupLabel(group.label);
              }}
              onDragLeave={() => setDragOverGroupLabel(null)}
              onDrop={(event) => handleGroupDrop(group, event)}
            >
              <DraftPhotoLabelCard
                label={group.label}
                activeElementName={activeElementName}
                slots={group.slots.map((slot) => ({
                  name: slot.name,
                  caption:
                    group.slots.length === 1
                      ? removeHyphens(group.label)
                      : removeHyphens(slot.name.slice(group.label.length + 1)),
                  photo: slot.photo,
                  status: slot.status,
                }))}
                onUpload={onUpload}
                onReplace={onReplace}
                onSelect={onSelect}
                replacingPhotoId={replacingPhotoId}
                uploadDisabled={uploadDisabled}
                registerNode={registerNode}
              />
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activePhoto && activeSize && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activePhoto.url}
            alt=""
            style={{ width: activeSize.width, height: activeSize.height }}
            className="rounded-xl object-cover shadow-lg"
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
