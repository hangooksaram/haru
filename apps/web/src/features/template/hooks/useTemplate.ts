"use client";

import { useQuery } from "@tanstack/react-query";

import type { TemplateDetail } from "@/features/template/types";

export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: ["template", templateId],
    queryFn: async (): Promise<TemplateDetail> => {
      const response = await fetch(`/api/templates/${templateId}`);
      if (!response.ok) {
        throw new Error("템플릿을 불러오지 못했습니다.");
      }

      return response.json();
    },
  });
}
