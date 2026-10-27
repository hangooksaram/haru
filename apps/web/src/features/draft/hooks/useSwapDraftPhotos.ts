"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Draft } from "@/features/draft/types";

type SwapDraftPhotosInput = {
  from: string;
  to: string;
};

export function useSwapDraftPhotos(draftId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["draft", draftId];

  return useMutation({
    mutationFn: async ({ from, to }: SwapDraftPhotosInput) => {
      const response = await fetch(`/api/drafts/${draftId}/photos/swap`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      });
      if (!response.ok) throw new Error("사진 교체에 실패했습니다.");
    },
    onMutate: async ({ from, to }: SwapDraftPhotosInput) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Draft>(queryKey);

      if (previous) {
        const photos = previous.photos.map((photo) => {
          if (photo.name === from) return { ...photo, name: to };
          if (photo.name === to) return { ...photo, name: from };

          return photo;
        });

        queryClient.setQueryData<Draft>(queryKey, { ...previous, photos });
      }

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData<Draft>(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
