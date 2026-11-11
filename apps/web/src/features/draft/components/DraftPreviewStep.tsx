"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { useDraft } from "@/features/draft/hooks/useDraft";
import { elementKey } from "@/features/draft/lib/elementKey";
import { removeHyphens } from "@/features/draft/lib/removeHyphens";
import { useCreateOrderFromDraft } from "@/features/order/hooks/useCreateOrderFromDraft";
import { useTemplateTextElements } from "@/features/template/hooks/useTemplateTextElements";
import { createClient } from "@/lib/supabase/client";

type Props = {
  templateId: string;
};

type EditItem = {
  label: string;
  href: string;
};

export function DraftPreviewStep({ templateId }: Props) {
  const router = useRouter();
  const { draftId } = useDraftId();
  const { data: draft, isLoading: isDraftLoading } = useDraft(draftId ?? null);
  const { data: textElements, isLoading: isTextElementsLoading } =
    useTemplateTextElements(templateId);
  const createOrder = useCreateOrderFromDraft();
  const [message, setMessage] = useState<string | null>(null);

  if (
    !draftId ||
    isDraftLoading ||
    isTextElementsLoading ||
    !draft ||
    !textElements
  ) {
    return <p className="text-muted-foreground">불러오는 중...</p>;
  }

  const editItems: EditItem[] = [
    { label: "템플릿", href: "/templates" },
    { label: "사진", href: `/draft/${templateId}/photos?return=preview` },
    { label: "텍스트", href: `/draft/${templateId}/text?return=preview` },
  ];

  const texts = Object.fromEntries(
    draft.texts.map(({ name, text }) => [name, text]),
  );

  async function handleOrderClick() {
    console.log("handleOrderClick", { draftId, templateId });
    if (!draftId) return;

    const paymentPath = `/draft/${templateId}/payment`;
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();

    if (data.user?.is_anonymous) {
      router.push(`/login?next=${encodeURIComponent(paymentPath)}`);
      return;
    }

    setMessage(null);
    try {
      const order = await createOrder.mutateAsync(draftId);
      router.push(`${paymentPath}?orderId=${order.id}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "주문 생성에 실패했습니다.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="max-w-[200px]">
        <CardContent className="text-muted-foreground flex aspect-video items-center justify-center">
          미리보기는 준비 중입니다
        </CardContent>
      </Card>

      <div className="text-muted-foreground flex flex-col gap-1 text-sm">
        <p>사진 {draft.photos.length}장</p>
        {textElements.map((element) => (
          <p key={elementKey(element)}>
            {removeHyphens(element.name)}: {texts[elementKey(element)] ?? ""}
          </p>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg">
              수정하기
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {editItems.map((item) => (
              <DropdownMenuItem key={item.label} asChild>
                <Link href={item.href}>{item.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="lg"
          onClick={handleOrderClick}
          disabled={createOrder.isPending}
        >
          이 시안으로 주문
        </Button>
      </div>

      {message && (
        <p className="text-sm font-medium text-amber-600">{message}</p>
      )}
    </div>
  );
}
