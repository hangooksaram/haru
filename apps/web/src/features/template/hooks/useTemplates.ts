"use client";

import { useQuery } from "@tanstack/react-query";

import type { TemplateDetail } from "@/features/template/types";

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async (): Promise<TemplateDetail[]> => {
      const response = await fetch("/api/templates");
      if (!response.ok) {
        throw new Error("템플릿 목록을 불러오지 못했습니다.");
      }

      return response.json();
    },
  });
}
