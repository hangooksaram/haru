import Link from "next/link";

import { Badge } from "@/components/ui/badge";

// 썸네일이 API에 없어서, 템플릿 id로 색상을 정해 placeholder로 사용한다.
const PLACEHOLDER_COLORS = ["#DCEFFB", "#FCE4E4", "#FFF3D6", "#E7E1F7"];

function getPlaceholderColor(id: string) {
  const sum = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PLACEHOLDER_COLORS[sum % PLACEHOLDER_COLORS.length];
}

// Creatomate 에디터에서 템플릿 태그를 `price:12000`, `category:결혼` 형식으로 입력한다.
function parseTemplateTags(tags: string[]): {
  price?: number;
  category?: string;
} {
  const result: { price?: number; category?: string } = {};

  for (const tag of tags) {
    const [key, ...rest] = tag.split(":");
    const value = rest.join(":").trim();
    if (value === "") continue;

    if (key.trim() === "price") {
      const price = Number(value);
      if (Number.isFinite(price)) result.price = price;
    } else if (key.trim() === "category") {
      result.category = value;
    }
  }

  return result;
}

export type Template = {
  id: string;
  name: string;
  tags: string[];
};

type Props = {
  template: Template;
};

export function TemplateCard({ template }: Props) {
  const { price, category } = parseTemplateTags(template.tags);

  return (
    <Link
      href={`/draft/${template.id}`}
      className="group flex flex-col gap-2.5"
    >
      <div
        className="flex aspect-3/4 items-end rounded-2xl p-3.5 transition-transform group-hover:-translate-y-1"
        style={{ backgroundColor: getPlaceholderColor(template.id) }}
      >
        {price !== undefined && (
          <Badge className="bg-background/85 text-foreground">
            {price.toLocaleString("ko-KR")}원
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
      </div>
    </Link>
  );
}
