import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import type { Template } from "@/features/template/types";

// 썸네일이 API에 없어서, 템플릿 id로 색상을 정해 placeholder로 사용한다.
const PLACEHOLDER_COLORS = ["#DCEFFB", "#FCE4E4", "#FFF3D6", "#E7E1F7"];

function getPlaceholderColor(id: string) {
  const sum = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PLACEHOLDER_COLORS[sum % PLACEHOLDER_COLORS.length];
}

function formatDuration(seconds: number): string {
  const totalSeconds = Math.round(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

type Props = {
  template: Template;
};

export function TemplateCard({ template }: Props) {
  const category = template.tags[0];

  return (
    <Link
      href={`/draft/${template.id}`}
      className="group flex flex-col gap-2.5"
    >
      <div
        className="flex aspect-3/4 items-end rounded-2xl p-3.5 transition-transform group-hover:-translate-y-1"
        style={{ backgroundColor: getPlaceholderColor(template.id) }}
      >
        {template.price !== null && (
          <Badge className="bg-background/85 text-foreground">
            {template.price.toLocaleString("ko-KR")}원
          </Badge>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        {category && (
          <span className="text-muted-foreground text-xs font-medium">
            {category}
          </span>
        )}
        <span className="text-sm font-semibold">{template.name}</span>
        <span className="text-muted-foreground text-xs">
          {formatDuration(template.duration)} · 사진 {template.photoCount}장
        </span>
      </div>
    </Link>
  );
}
