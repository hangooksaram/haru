import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DraftTextStep } from "./DraftTextStep";

const { toast } = vi.hoisted(() => ({
  toast: { error: vi.fn() },
}));
const { useRouter } = vi.hoisted(() => ({ useRouter: vi.fn() }));
const { useDraftId } = vi.hoisted(() => ({ useDraftId: vi.fn() }));
const { useCreateDraft } = vi.hoisted(() => ({ useCreateDraft: vi.fn() }));
const { useDraft } = vi.hoisted(() => ({ useDraft: vi.fn() }));
const { useUpdateDraftTexts } = vi.hoisted(() => ({
  useUpdateDraftTexts: vi.fn(),
}));
const { useTemplateTextElements } = vi.hoisted(() => ({
  useTemplateTextElements: vi.fn(),
}));
const { useDraftPreview } = vi.hoisted(() => ({
  useDraftPreview: vi.fn(),
}));

vi.mock("sonner", () => ({ toast }));
vi.mock("next/navigation", () => ({ useRouter }));
vi.mock("@/features/draft/components/DraftIdProvider", () => ({ useDraftId }));
vi.mock("@/features/draft/hooks/useCreateDraft", () => ({ useCreateDraft }));
vi.mock("@/features/draft/hooks/useDraft", () => ({ useDraft }));
vi.mock("@/features/draft/hooks/useUpdateDraftTexts", () => ({
  useUpdateDraftTexts,
}));
vi.mock("@/features/template/hooks/useTemplateTextElements", () => ({
  useTemplateTextElements,
}));
vi.mock("@/features/draft/hooks/useDraftPreview", () => ({
  useDraftPreview,
}));

function setup({
  draftTexts = [],
  activeElementName = null,
}: {
  draftTexts?: { name: string; text: string }[];
  activeElementName?: string | null;
} = {}) {
  const mutate = vi.fn();
  const selectElement = vi.fn();

  useRouter.mockReturnValue({ push: vi.fn() });
  useDraftId.mockReturnValue({ draftId: "draft-1", setDraftId: vi.fn() });
  useCreateDraft.mockReturnValue({ mutate: vi.fn() });
  useDraft.mockReturnValue({
    data: { id: "draft-1", texts: draftTexts },
    isLoading: false,
  });
  useUpdateDraftTexts.mockReturnValue({ mutate });
  useTemplateTextElements.mockReturnValue({
    data: [
      { type: "기본정보", name: "상호명", text: "하루" },
      { type: "자막", name: "1", text: "첫 장면" },
    ],
    isLoading: false,
  });
  useDraftPreview.mockReturnValue({
    containerRef: { current: null },
    isLoading: false,
    isBuffering: false,
    error: null,
    activeElementName,
    selectElement,
    replay: vi.fn(),
    isPlayingAll: false,
    toggleAll: vi.fn(),
    playbackProgress: 0,
  });

  return { mutate, selectElement };
}

describe("DraftTextStep", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("입력할 때마다(디바운스 후) 서버에 자동 저장한다", async () => {
    const { mutate } = setup();
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    render(
      <DraftTextStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );
    await user.type(screen.getByPlaceholderText("하루"), "철수네 사진관");

    expect(mutate).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith([
      { type: "기본정보", name: "상호명", text: "철수네 사진관" },
      { type: "자막", name: "1", text: "" },
    ]);
  });

  it("같은 시안에 다시 들어오면 서버에 자동 저장된 값을 입력창에 채운다", () => {
    setup({ draftTexts: [{ name: "기본정보_상호명", text: "철수네 사진관" }] });

    render(
      <DraftTextStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );

    expect(screen.getByPlaceholderText("하루")).toHaveValue("철수네 사진관");
  });

  it("복원한 값도 입력 검증(줄바꿈 제거)을 거친다", () => {
    setup({
      draftTexts: [{ name: "기본정보_상호명", text: "철수네\n사진관" }],
    });

    render(
      <DraftTextStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );

    expect(screen.getByPlaceholderText("하루")).toHaveValue("철수네 사진관");
  });

  it("기본정보가 비어 있으면 그 항목만 제외하고 자동 저장한다", async () => {
    const { mutate } = setup({
      draftTexts: [{ name: "기본정보_상호명", text: "철수네 사진관" }],
    });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    render(
      <DraftTextStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );
    await user.clear(screen.getByPlaceholderText("하루"));
    await vi.advanceTimersByTimeAsync(500);

    expect(mutate).toHaveBeenCalledWith([
      { type: "자막", name: "1", text: "" },
    ]);
  });

  it("기본정보를 모두 입력하지 않으면 다음으로 이동하지 않는다", async () => {
    setup();
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    render(
      <DraftTextStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );
    await user.click(screen.getByRole("button", { name: "이 시안으로 주문" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "기본정보를 모두 입력해 주세요.",
      ),
    );
  });

  it("요소 이름을 클릭하면 미리보기를 해당 요소 위치로 이동시킨다", async () => {
    const { selectElement } = setup();
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    render(
      <DraftTextStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );
    await user.click(screen.getByRole("button", { name: "상호명" }));

    expect(selectElement).toHaveBeenCalledWith("상호명");
  });

  it("미리보기가 보여주는 요소의 입력 옆에 미리보기 중을 보여준다", () => {
    setup({ activeElementName: "상호명" });

    render(
      <DraftTextStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );

    expect(screen.getByText("미리보기 중")).toBeInTheDocument();
  });
});
