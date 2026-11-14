import Link from "next/link";

import { getTemplateTags } from "@/features/template/service/get-template-tags";

export default async function TemplateTagsPage() {
  const tags = await getTemplateTags();

  return (
    <div className="flex flex-col gap-10 py-10">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">
        어떤 순간을 준비하고 있나요?
      </h1>
      {tags.length === 0 && (
        <p className="text-muted-foreground">아직 준비된 종류가 없어요.</p>
      )}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/templates?tag=${encodeURIComponent(tag)}`}
            className="bg-card hover:bg-muted flex aspect-3/4 items-center justify-center rounded-2xl border text-lg font-semibold transition-colors"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
