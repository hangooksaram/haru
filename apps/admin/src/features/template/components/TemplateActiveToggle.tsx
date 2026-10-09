"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";

type Props = {
  templateId: string;
  isActive: boolean;
};

export function TemplateActiveToggle({ templateId, isActive }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCheckedChange(checked: boolean) {
    startTransition(async () => {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: checked }),
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
    <label className="flex items-center gap-1.5">
      <Switch
        checked={isActive}
        onCheckedChange={handleCheckedChange}
        disabled={isPending}
      />
      <span className="text-muted-foreground text-xs">공개</span>
    </label>
  );
}
