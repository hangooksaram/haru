import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DraftEntryRedirect } from "@/features/draft/components/DraftEntryRedirect";

const { replace, useDraftId, useDraft } = vi.hoisted(() => ({
  replace: vi.fn(),
  useDraftId: vi.fn(),
  useDraft: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/features/draft/components/DraftIdProvider", () => ({
  useDraftId,
}));
vi.mock("@/features/draft/hooks/useDraft", () => ({ useDraft }));

function setup({
  draftId,
  isFreshlyCreated,
  draft,
}: {
  draftId: string | null | undefined;
  isFreshlyCreated: boolean;
  draft?: unknown;
}) {
  useDraftId.mockReturnValue({ draftId, isFreshlyCreated });
  useDraft.mockReturnValue({ data: draft, isError: false });
}

describe("DraftEntryRedirect", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it("같은 세션 안에서 다시 들어오면 모달 없이 시안의 last_step(필수 항목이 빈 단계가 있으면 그 첫 단계)으로 이동한다", () => {
    setup({
      draftId: "draft-1",
      isFreshlyCreated: true,
      draft: { id: "draft-1", resumeStep: "subtitle" },
    });

    render(<DraftEntryRedirect templateId="template-1" />);

    expect(replace).toHaveBeenCalledWith("/draft/template-1/subtitle");
  });

  it("같은 세션이 아니면 기본정보로 보내 이어하기 모달에서 고르게 한다", () => {
    setup({ draftId: "draft-1", isFreshlyCreated: false });

    render(<DraftEntryRedirect templateId="template-1" />);

    expect(replace).toHaveBeenCalledWith("/draft/template-1/basic-info");
  });

  it("저장된 시안이 없으면 기본정보로 보낸다", () => {
    setup({ draftId: null, isFreshlyCreated: false });

    render(<DraftEntryRedirect templateId="template-1" />);

    expect(replace).toHaveBeenCalledWith("/draft/template-1/basic-info");
  });
});
