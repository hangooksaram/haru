"use client";

import { useMutation } from "@tanstack/react-query";

export function useCreateDraft() {
  return useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      if (!response.ok) throw new Error("시안 생성에 실패했습니다.");

      return (await response.json()) as { id: string };
    },
  });
}
