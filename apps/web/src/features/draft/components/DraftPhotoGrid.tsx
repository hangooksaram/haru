"use client";

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { DraftPhotoItem } from "@/features/draft/components/DraftPhotoItem";

import type { DraftPhoto } from "@/features/draft/types";

type Props = {
  photos: DraftPhoto[];
  onReorder: (photoIds: string[]) => void;
  onReplace: (photoId: string, file: File) => void;
  replacingPhotoId: string | null;
  trailing?: React.ReactNode;
};

export function DraftPhotoGrid({
  photos,
  onReorder,
  onReplace,
  replacingPhotoId,
  trailing,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((photo) => photo.id === active.id);
    const newIndex = photos.findIndex((photo) => photo.id === over.id);
    const reordered = arrayMove(photos, oldIndex, newIndex);

    onReorder(reordered.map((photo) => photo.id));
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext
        items={photos.map((photo) => photo.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <DraftPhotoItem
              key={photo.id}
              photo={photo}
              index={index}
              isReplacing={replacingPhotoId === photo.id}
              onReplace={(file) => onReplace(photo.id, file)}
            />
          ))}
          {trailing}
        </div>
      </SortableContext>
    </DndContext>
  );
}
