"use client";

import { useMutation } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";

export function useCreateDraft() {
  return useMutation({
    mutationFn: async (templateId: string) => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
      }

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
