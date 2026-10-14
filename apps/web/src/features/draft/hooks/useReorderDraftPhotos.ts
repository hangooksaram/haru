"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Draft } from "@/features/draft/types";

export function useReorderDraftPhotos(draftId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["draft", draftId];

  return useMutation({
    mutationFn: async (photoIds: string[]) => {
      const response = await fetch(`/api/drafts/${draftId}/photos/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds }),
      });
      if (!response.ok) throw new Error("순서 변경에 실패했습니다.");
    },
    onMutate: async (photoIds: string[]) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Draft>(queryKey);

      if (previous) {
        const photoById = new Map(
          previous.photos.map((photo) => [photo.id, photo]),
        );
        const reordered = photoIds.map((id, position) => ({
          ...photoById.get(id)!,
          position,
        }));

        queryClient.setQueryData<Draft>(queryKey, {
          ...previous,
          photos: reordered,
        });
      }

      return { previous };
    },
    onError: (_error, _photoIds, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Draft>(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
