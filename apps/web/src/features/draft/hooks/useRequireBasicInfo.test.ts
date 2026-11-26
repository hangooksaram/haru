import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useRequireBasicInfo } from "./useRequireBasicInfo";

const { useRouter } = vi.hoisted(() => ({ useRouter: vi.fn() }));
const { useDraftId } = vi.hoisted(() => ({ useDraftId: vi.fn() }));
const { useDraft } = vi.hoisted(() => ({ useDraft: vi.fn() }));
const { useTemplateTextElements } = vi.hoisted(() => ({
  useTemplateTextElements: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter }));
vi.mock("@/features/draft/components/DraftIdProvider", () => ({ useDraftId }));
vi.mock("@/features/draft/hooks/useDraft", () => ({ useDraft }));
vi.mock("@/features/template/hooks/useTemplateTextElements", () => ({
  useTemplateTextElements,
}));

function setup({
  draftId = "draft-1",
  texts = [] as { name: string; text: string }[],
  isFetchedAfterMount = true,
}: {
  draftId?: string | null | "loading";
  texts?: { name: string; text: string }[];
  isFetchedAfterMount?: boolean;
} = {}) {
  const replace = vi.fn();
  useRouter.mockReturnValue({ replace });
  useDraftId.mockReturnValue({
    draftId: draftId === "loading" ? undefined : draftId,
  });
  useDraft.mockReturnValue({
    data: draftId && draftId !== "loading" ? { id: draftId, texts } : undefined,
    isFetchedAfterMount,
  });
  useTemplateTextElements.mockReturnValue({
    data: [{ type: "기본정보", name: "상호명", text: "하루" }],
  });

  return { replace };
}

describe("useRequireBasicInfo", () => {
  it("시안이 없으면 기본정보 단계로 보낸다", () => {
    const { replace } = setup({ draftId: null });

    renderHook(() => useRequireBasicInfo("template-1"));

    expect(replace).toHaveBeenCalledWith("/draft/template-1/basic-info");
  });

  it("기본정보가 모두 채워지지 않았으면 기본정보 단계로 보낸다", () => {
    const { replace } = setup({ texts: [] });

    renderHook(() => useRequireBasicInfo("template-1"));

    expect(replace).toHaveBeenCalledWith("/draft/template-1/basic-info");
  });

  it("기본정보가 모두 채워졌으면 그대로 둔다", () => {
    const { replace } = setup({ texts: [{ name: "상호명", text: "철수네" }] });

    renderHook(() => useRequireBasicInfo("template-1"));

    expect(replace).not.toHaveBeenCalled();
  });

  it("시안 확인 중(draftId 미확정)이거나 최신 조회 전이면 이동하지 않는다", () => {
    const loading = setup({ draftId: "loading" });
    renderHook(() => useRequireBasicInfo("template-1"));
    expect(loading.replace).not.toHaveBeenCalled();

    const stale = setup({ texts: [], isFetchedAfterMount: false });
    renderHook(() => useRequireBasicInfo("template-1"));
    expect(stale.replace).not.toHaveBeenCalled();
  });

  it("enabled가 false면 확인하지 않는다", () => {
    const { replace } = setup({ draftId: null });

    renderHook(() => useRequireBasicInfo("template-1", false));

    expect(replace).not.toHaveBeenCalled();
  });
});
