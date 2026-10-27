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
import { useRef, useState } from "react";

import { DraftPhotoItem } from "@/features/draft/components/DraftPhotoItem";

import type { DraftPhoto } from "@/features/draft/types";

export type DraftPhotoSlot = {
  label: string;
  photo: DraftPhoto | null;
};

type Props = {
  slots: DraftPhotoSlot[];
  onSwap: (from: string, to: string) => void;
  onUpload: (label: string, files: File[]) => void;
  onReplace: (photoId: string, file: File) => void;
  replacingPhotoId: string | null;
  uploadDisabled: boolean;
};

export function DraftPhotoGrid({
  slots,
  onSwap,
  onUpload,
  onReplace,
  replacingPhotoId,
  uploadDisabled,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [activeSize, setActiveSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const activePhoto =
    slots.find((slot) => slot.label === activeLabel)?.photo ?? null;
  const nodesRef = useRef(new Map<string, HTMLElement>());

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
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {slots.map((slot) => (
          <DraftPhotoItem
            key={slot.label}
            label={slot.label}
            photo={slot.photo}
            isReplacing={slot.photo?.id === replacingPhotoId}
            onReplace={(file) => {
              if (slot.photo) onReplace(slot.photo.id, file);
            }}
            onUpload={(files) => onUpload(slot.label, files)}
            uploadDisabled={uploadDisabled}
            registerNode={registerNode}
          />
        ))}
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
