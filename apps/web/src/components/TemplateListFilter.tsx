"use client";

import { useMemo, useState } from "react";

import { TemplateCard } from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filterTemplates } from "@/features/template/lib/filterTemplates";
import { resolveInitialTag } from "@/features/template/lib/resolveInitialTag";

import type { Template } from "@/features/template/types";

type Props = {
  templates: Template[];
  tagOptions: string[];
  initialTag?: string;
};

export function TemplateListFilter({ templates, tagOptions, initialTag }: Props) {
  const [selectedTag, setSelectedTag] = useState<string | null>(
    resolveInitialTag(initialTag, tagOptions),
  );
  const [search, setSearch] = useState("");

  const filteredTemplates = useMemo(
    () => filterTemplates(templates, selectedTag, search),
    [templates, selectedTag, search],
  );

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
        {tagOptions.map((tag) => (
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
