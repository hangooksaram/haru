"use client";

import { useQuery } from "@tanstack/react-query";

import type { TemplateTextElement } from "@/features/template/types";

export function useTemplateTextElements(templateId: string) {
  return useQuery({
    queryKey: ["template-text-elements", templateId],
    queryFn: async (): Promise<TemplateTextElement[]> => {
      const response = await fetch(
        `/api/templates/${templateId}/text-elements`,
      );
      if (!response.ok) {
        throw new Error("템플릿 텍스트 요소를 불러오지 못했습니다.");
      }

      return response.json();
    },
  });
}
