import { TemplateVideoCard } from "@/components/TemplateVideoCard";
import { getVideoSrcForIndex } from "@/components/video-slides";
import { SECTION_TITLE } from "@/lib/styles";
import { cn } from "@/lib/utils";

import type { Template } from "@/features/template/types";

type Props = {
  templates: Template[];
};

export function VideoListSection({ templates }: Props) {
  if (templates.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-16">
      <span className="text-brand-deep text-sm font-bold">VIDEOS</span>
      <h2 className={cn(SECTION_TITLE, "mt-3 mb-6 sm:mb-8")}>영상 둘러보기</h2>
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
        {templates.map((template, index) => (
          <TemplateVideoCard
            key={template.id}
            template={template}
            videoSrc={getVideoSrcForIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}
