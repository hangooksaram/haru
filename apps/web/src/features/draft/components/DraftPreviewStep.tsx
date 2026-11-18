"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DraftPhotoOrderDebug } from "@/features/draft/components/DraftPhotoOrderDebug";
import { DraftVideoPreview } from "@/features/draft/components/DraftVideoPreview";
import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { useDraft } from "@/features/draft/hooks/useDraft";
import { removeHyphens } from "@/features/draft/lib/removeHyphens";
import { useCreateOrderWithGuestResume } from "@/features/order/hooks/useCreateOrderWithGuestResume";
import { useTemplateTextElements } from "@/features/template/hooks/useTemplateTextElements";

type Props = {
  templateId: string;
};

type EditItem = {
  label: string;
  href: string;
};

export function DraftPreviewStep({ templateId }: Props) {
  const { draftId } = useDraftId();
  const { data: draft, isLoading: isDraftLoading } = useDraft(draftId ?? null);
  const { data: textElements, isLoading: isTextElementsLoading } =
    useTemplateTextElements(templateId);
  const { handleOrderClick, message, isPending } =
    useCreateOrderWithGuestResume(templateId);

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

  return (
    <div className="flex flex-col gap-6">
      <DraftVideoPreview
        templateId={templateId}
        photos={draft.photos}
        texts={draft.texts}
      />

      <DraftPhotoOrderDebug templateId={templateId} photos={draft.photos} />

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
        <Button size="lg" onClick={handleOrderClick} disabled={isPending}>
          이 시안으로 주문
        </Button>
      </div>

      {message && (
        <p className="text-sm font-medium text-amber-600">{message}</p>
      )}
    </div>
  );
}
