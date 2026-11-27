"use client";

import { useQuery } from "@tanstack/react-query";

import { validateVideoRequestAction } from "@/features/video/actions/validate-video-request-action";

// /payment에 입장할 때마다 검증하므로 캐시하지 않는다.
export function useVideoRequestValidation(draftId: string | null) {
  return useQuery({
    queryKey: ["video-request-validation", draftId],
    queryFn: () => validateVideoRequestAction(draftId as string),
    enabled: draftId !== null,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
