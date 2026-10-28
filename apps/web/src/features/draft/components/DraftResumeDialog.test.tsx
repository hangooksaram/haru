import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DraftResumeDialog } from "./DraftResumeDialog";

const { useQueryClient } = vi.hoisted(() => ({ useQueryClient: vi.fn() }));
const { useDraftId } = vi.hoisted(() => ({ useDraftId: vi.fn() }));
const { useDraft } = vi.hoisted(() => ({ useDraft: vi.fn() }));
const { useDeleteDraft } = vi.hoisted(() => ({ useDeleteDraft: vi.fn() }));

vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient,
}));
vi.mock("@/features/draft/components/DraftIdProvider", () => ({
  useDraftId,
}));
vi.mock("@/features/draft/hooks/useDraft", () => ({ useDraft }));
vi.mock("@/features/draft/hooks/useDeleteDraft", () => ({ useDeleteDraft }));

const TITLE = "작성 중이던 시안이 있어요";

function setup({
  draftId = "draft-1",
  draft = { id: "draft-1" },
  isFreshlyCreated = false,
  mutate = vi.fn(),
  isPending = false,
  error = null,
}: Partial<{
  draftId: string | null;
  draft: unknown;
  isFreshlyCreated: boolean;
  mutate: ReturnType<typeof vi.fn>;
  isPending: boolean;
  error: Error | null;
}> = {}) {
  const clearDraftId = vi.fn();
  const removeQueries = vi.fn();
  const acknowledgeResume = vi.fn();

  useQueryClient.mockReturnValue({ removeQueries });
  useDraftId.mockReturnValue({
    draftId,
    clearDraftId,
    isFreshlyCreated,
    acknowledgeResume,
  });
  useDraft.mockReturnValue({ data: draft });
  useDeleteDraft.mockReturnValue({ mutate, isPending, error });

  return { clearDraftId, removeQueries, mutate, acknowledgeResume };
}

describe("DraftResumeDialog", () => {
  it("이어할 시안이 있으면 선택 모달을 보여준다", () => {
    setup();

    render(<DraftResumeDialog />);

    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "이어서 작성" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "새로 시작" }),
    ).toBeInTheDocument();
  });

  it("저장된 시안이 없으면 모달을 보여주지 않는다", () => {
    setup({ draftId: null, draft: undefined });

    render(<DraftResumeDialog />);

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
  });

  it("이번 방문에서 막 새로 만든 시안이면 모달을 보여주지 않는다", () => {
    setup({ isFreshlyCreated: true });

    render(<DraftResumeDialog />);

    expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
  });

  it("'이어서 작성'을 선택하면 acknowledgeResume을 호출한다", async () => {
    const { acknowledgeResume } = setup();
    const user = userEvent.setup();

    render(<DraftResumeDialog />);
    await user.click(screen.getByRole("button", { name: "이어서 작성" }));

    expect(acknowledgeResume).toHaveBeenCalled();
  });

  it("'새로 시작'을 선택하면 시안을 삭제하고 캐시를 정리한다", async () => {
    const mutate = vi.fn(
      (_draftId: string, options?: { onSuccess?: () => void }) =>
        options?.onSuccess?.(),
    );
    const { clearDraftId, removeQueries } = setup({ mutate });
    const user = userEvent.setup();

    render(<DraftResumeDialog />);
    await user.click(screen.getByRole("button", { name: "새로 시작" }));

    expect(mutate).toHaveBeenCalledWith("draft-1", expect.anything());
    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: ["draft", "draft-1"],
    });
    expect(clearDraftId).toHaveBeenCalled();
  });

  it("삭제가 실패하면 에러 메시지를 보여주고 모달을 유지한다", () => {
    setup({ error: new Error("실패") });

    render(<DraftResumeDialog />);

    expect(
      screen.getByText("시안을 삭제하지 못했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
    expect(screen.getByText(TITLE)).toBeInTheDocument();
  });
});
