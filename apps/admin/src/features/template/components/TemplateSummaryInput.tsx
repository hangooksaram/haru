"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";

const SUMMARY_MAX_LENGTH = 40;

type Props = {
  templateId: string;
  lang: "ko" | "en";
  value: string;
};

export function TemplateSummaryInput({ templateId, lang, value }: Props) {
  const [text, setText] = useState(value);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleBlur() {
    if (text === value) return;

    if (text.length > SUMMARY_MAX_LENGTH) {
      toast.error(`소개 문구는 ${SUMMARY_MAX_LENGTH}자 이하로 입력해주세요.`);
      setText(value);
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: { [lang]: text } }),
      });
      const result = await response.json();

      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.message ?? "저장 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground w-6 text-xs uppercase">
        {lang}
      </span>
      <Input
        className="h-8 w-40"
        maxLength={SUMMARY_MAX_LENGTH}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={handleBlur}
        disabled={isPending}
      />
    </div>
  );
}
