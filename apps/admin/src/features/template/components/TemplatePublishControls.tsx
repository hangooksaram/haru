"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type Props = {
  templateId: string;
  price: number | null;
  isActive: boolean;
};

export function TemplatePublishControls({
  templateId,
  price,
  isActive,
}: Props) {
  const [priceInput, setPriceInput] = useState(price?.toString() ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function save(data: { price?: number | null; isActive?: boolean }) {
    startTransition(async () => {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.message ?? "저장 중 오류가 발생했습니다.");
      }
    });
  }

  function handlePriceBlur() {
    const trimmed = priceInput.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);

    if (parsed !== null && !Number.isFinite(parsed)) {
      toast.error("가격은 숫자로 입력해주세요.");
      setPriceInput(price?.toString() ?? "");
      return;
    }

    if (parsed === price) return;
    save({ price: parsed });
  }

  return (
    <div className="flex items-center gap-3">
      <Input
        type="number"
        inputMode="numeric"
        placeholder="가격"
        className="h-8 w-24"
        value={priceInput}
        onChange={(event) => setPriceInput(event.target.value)}
        onBlur={handlePriceBlur}
        disabled={isPending}
      />
      <label className="flex items-center gap-1.5">
        <Switch
          checked={isActive}
          onCheckedChange={(checked) => save({ isActive: checked })}
          disabled={isPending}
        />
        <span className="text-muted-foreground text-xs">공개</span>
      </label>
    </div>
  );
}
