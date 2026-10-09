"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";

type Props = {
  templateId: string;
  price: number | null;
};

export function TemplatePriceInput({ templateId, price }: Props) {
  const [priceInput, setPriceInput] = useState(price?.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleBlur() {
    const trimmed = priceInput.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);

    if (parsed !== null && !Number.isFinite(parsed)) {
      toast.error("가격은 숫자로 입력해주세요.");
      setPriceInput(price?.toString() ?? "");
      return;
    }

    if (parsed === price) return;

    startTransition(async () => {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: parsed }),
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
    <Input
      type="number"
      inputMode="numeric"
      className="h-8 w-24"
      value={priceInput}
      onChange={(event) => setPriceInput(event.target.value)}
      onBlur={handleBlur}
      disabled={isPending}
    />
  );
}
