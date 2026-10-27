"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { useDraft } from "@/features/draft/hooks/useDraft";

type Props = {
  templateId: string;
};

type EditItem = {
  label: string;
  href: string;
};

export function DraftPreviewStep({ templateId }: Props) {
  const { draftId } = useDraftId();
  const { data: draft, isLoading } = useDraft(draftId ?? null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);

  if (!draftId || isLoading || !draft) {
    return <p className="text-muted-foreground">불러오는 중...</p>;
  }

  const editItems: EditItem[] = [
    { label: "템플릿", href: "/templates" },
    { label: "사진", href: `/draft/${templateId}/photos?return=preview` },
    { label: "텍스트", href: `/draft/${templateId}/text?return=preview` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex aspect-video items-center justify-center text-muted-foreground">
          미리보기는 준비 중입니다
        </CardContent>
      </Card>

      <div className="text-muted-foreground flex flex-col gap-1 text-sm">
        <p>사진 {draft.photos.length}장</p>
        {draft.texts.map((text) => (
          <p key={text.name}>
            {text.name}: {text.text}
          </p>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsEditPanelOpen((prev) => !prev)}
        >
          수정하기
        </Button>
        <Button asChild size="lg">
          <Link href={`/draft/${templateId}/payment`}>이 시안으로 주문</Link>
        </Button>
      </div>

      {isEditPanelOpen && (
        <ul className="flex flex-col gap-2">
          {editItems.map((item) => (
            <li key={item.label}>
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
