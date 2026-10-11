"use client";

import { useMemo, useState } from "react";

import { TemplateCard } from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { Template } from "@/features/template/types";

// 노션 "템플릿 선택" 정책: 태그 필터는 일단 결혼·돌잔치만 둔다.
const TAG_OPTIONS = ["결혼", "돌잔치"];

type Props = {
  templates: Template[];
  initialTag?: string;
};

export function TemplateListFilter({ templates, initialTag }: Props) {
  const [selectedTag, setSelectedTag] = useState<string | null>(
    initialTag && TAG_OPTIONS.includes(initialTag) ? initialTag : null,
  );
  const [search, setSearch] = useState("");

  const filteredTemplates = useMemo(() => {
    const trimmedSearch = search.trim();

    return templates.filter((template) => {
      if (selectedTag && !template.tags.includes(selectedTag)) return false;
      if (trimmedSearch && !template.name.includes(trimmedSearch)) {
        return false;
      }
      return true;
    });
  }, [templates, selectedTag, search]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={selectedTag === null ? "default" : "outline"}
          onClick={() => setSelectedTag(null)}
        >
          전체
        </Button>
        {TAG_OPTIONS.map((tag) => (
          <Button
            key={tag}
            type="button"
            variant={selectedTag === tag ? "default" : "outline"}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </Button>
        ))}
        <Input
          placeholder="템플릿 이름으로 검색"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="ml-auto h-9 max-w-60"
        />
      </div>
      {filteredTemplates.length === 0 ? (
        <p className="text-muted-foreground">조건에 맞는 템플릿이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
