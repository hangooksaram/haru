"use client";

import Link from "next/link";

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
import { useStoredDraftTexts } from "@/features/draft/hooks/useStoredDraftTexts";
import { elementKey } from "@/features/draft/lib/elementKey";
import { removeHyphens } from "@/features/draft/lib/removeHyphens";
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
  const { values: storedTexts } = useStoredDraftTexts(draftId ?? null);

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
            {removeHyphens(element.name)}:{" "}
            {storedTexts[elementKey(element)] ?? ""}
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
        <Button asChild size="lg">
          <Link href={`/draft/${templateId}/payment`}>이 시안으로 주문</Link>
        </Button>
      </div>
    </div>
  );
}
