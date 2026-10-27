"use client";

import { useQuery } from "@tanstack/react-query";

export function useTemplatePhotoElements(templateId: string) {
  return useQuery({
    queryKey: ["template-photo-elements", templateId],
    queryFn: async (): Promise<string[]> => {
      const response = await fetch(
        `/api/templates/${templateId}/photo-elements`,
      );
      if (!response.ok) {
        throw new Error("템플릿 사진 요소를 불러오지 못했습니다.");
      }

      return response.json();
    },
  });
}
