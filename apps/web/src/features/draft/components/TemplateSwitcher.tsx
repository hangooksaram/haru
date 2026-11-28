"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getVideoSrcForIndex } from "@/components/video-slides";
import { useCurrentUserId } from "@/features/auth/hooks/useCurrentUserId";
import { useDraftAcknowledged } from "@/features/draft/components/DraftAcknowledgedProvider";
import { TemplateSwitchCard } from "@/features/draft/components/TemplateSwitchCard";
import { TemplateSwitchConfirmDialog } from "@/features/draft/components/TemplateSwitchConfirmDialog";
import { DRAFT_STEP_SEGMENTS } from "@/features/draft/constants";
import { findStoredDraftId } from "@/features/draft/hooks/useStoredDraftId";
import { useTemplates } from "@/features/template/hooks/useTemplates";
import { extractUniqueTags } from "@/features/template/lib/extractUniqueTags";
import { filterTemplates } from "@/features/template/lib/filterTemplates";

import type { Draft, DraftStep } from "@/features/draft/types";
import type { TemplateDetail } from "@/features/template/types";

type Props = {
  templateId: string;
  templateName: string;
};

// 시안을 조회해 다시 열 단계를 받는다. 시안이 삭제됐거나 조회에 실패하면 null.
async function fetchDraftResumeStep(
  draftId: string,
): Promise<DraftStep | null> {
  try {
    const response = await fetch(`/api/drafts/${draftId}`);
    if (!response.ok) return null;

    const draft: Draft = await response.json();
    return draft.resumeStep;
  } catch {
    return null;
  }
}

// 스텝 바 왼쪽 끝의 템플릿 이름. 누르면 템플릿 목록을 스텝 바 아래로 펼쳐 템플릿을 바꿀 수 있다.
export function TemplateSwitcher({ templateId, templateName }: Props) {
  const router = useRouter();
  const currentUserId = useCurrentUserId();
  const { data: templates = [] } = useTemplates();
  const { acknowledge } = useDraftAcknowledged();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [pendingTemplate, setPendingTemplate] = useState<TemplateDetail | null>(
    null,
  );
  const [isSwitching, setIsSwitching] = useState(false);

  const tagOptions = extractUniqueTags(templates.map(({ tags }) => tags));
  const visibleTemplates = filterTemplates(templates, selectedTag, "");

  function handleSelect(template: TemplateDetail) {
    setIsOpen(false);
    if (template.id === templateId || currentUserId === undefined) return;

    setPendingTemplate(template);
  }

  async function handleConfirm() {
    if (!pendingTemplate || currentUserId === undefined) return;

    const nextTemplateId = pendingTemplate.id;
    const storedDraftId = findStoredDraftId(nextTemplateId, currentUserId);

    // 저장된 시안이 없으면 기본정보 화면에 들어갈 때 새 시안이 만들어진다.
    if (!storedDraftId) {
      setPendingTemplate(null);
      router.push(`/draft/${nextTemplateId}/basic-info`);
      return;
    }

    // 저장된 시안이 있으면 last_step(필수 항목이 빈 단계가 있으면 그 첫 단계)으로 다시 연다.
    // 바꾸기로 이미 확인했으므로 이어하기 모달은 띄우지 않는다.
    setIsSwitching(true);
    const resumeStep = await fetchDraftResumeStep(storedDraftId);
    if (resumeStep) acknowledge(storedDraftId);
    setIsSwitching(false);
    setPendingTemplate(null);
    router.push(
      `/draft/${nextTemplateId}/${DRAFT_STEP_SEGMENTS[resumeStep ?? "basic_info"]}`,
    );
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            title={templateName}
            className="hover:bg-muted data-[state=open]:bg-muted -ml-3 flex min-h-11 max-w-40 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-base font-medium sm:max-w-60"
          >
            <span className="truncate">{templateName}</span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 transition-transform in-data-[state=open]:rotate-180"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={10}
          aria-label="템플릿 변경"
          className="flex max-h-[calc(100vh-10rem)] w-[min(980px,calc(100vw-2.5rem))] flex-col gap-4 overflow-y-auto rounded-2xl p-6"
        >
          <div role="tablist" className="flex flex-wrap gap-2">
            <Button
              type="button"
              role="tab"
              size="sm"
              aria-selected={selectedTag === null}
              variant={selectedTag === null ? "default" : "outline"}
              onClick={() => setSelectedTag(null)}
            >
              전체
            </Button>
            {tagOptions.map((tag) => (
              <Button
                key={tag}
                type="button"
                role="tab"
                size="sm"
                aria-selected={selectedTag === tag}
                variant={selectedTag === tag ? "default" : "outline"}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {visibleTemplates.map((template) => (
              <TemplateSwitchCard
                key={template.id}
                template={template}
                videoSrc={getVideoSrcForIndex(templates.indexOf(template))}
                isCurrent={template.id === templateId}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <TemplateSwitchConfirmDialog
        nextTemplateName={pendingTemplate?.name ?? null}
        isPending={isSwitching}
        onConfirm={handleConfirm}
        onCancel={() => setPendingTemplate(null)}
      />
    </>
  );
}
