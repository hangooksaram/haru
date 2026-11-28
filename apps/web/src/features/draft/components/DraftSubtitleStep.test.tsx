import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DraftSubtitleStep } from "./DraftSubtitleStep";

const { toast } = vi.hoisted(() => ({
  toast: { error: vi.fn() },
}));
const { useRouter } = vi.hoisted(() => ({ useRouter: vi.fn() }));
const { useDraftId } = vi.hoisted(() => ({ useDraftId: vi.fn() }));
const { useCreateDraft } = vi.hoisted(() => ({ useCreateDraft: vi.fn() }));
const { useRequireBasicInfo } = vi.hoisted(() => ({
  useRequireBasicInfo: vi.fn(),
}));
const { useDraft } = vi.hoisted(() => ({ useDraft: vi.fn() }));
const { useUpdateDraftTexts } = vi.hoisted(() => ({
  useUpdateDraftTexts: vi.fn(),
}));
const { useTemplate } = vi.hoisted(() => ({ useTemplate: vi.fn() }));
const { useTemplateTextElements } = vi.hoisted(() => ({
  useTemplateTextElements: vi.fn(),
}));
const { useDraftPreviewContext } = vi.hoisted(() => ({
  useDraftPreviewContext: vi.fn(),
}));

vi.mock("@/features/draft/components/TemplateSwitcher", () => ({
  TemplateSwitcher: ({ templateName }: { templateName: string }) => (
    <span>{templateName}</span>
  ),
}));
vi.mock("sonner", () => ({ toast }));
vi.mock("next/navigation", () => ({ useRouter }));
vi.mock("@/features/draft/components/DraftIdProvider", () => ({ useDraftId }));
vi.mock("@/features/draft/hooks/useCreateDraft", () => ({ useCreateDraft }));
vi.mock("@/features/draft/hooks/useDraft", () => ({ useDraft }));
vi.mock("@/features/draft/hooks/useRequireBasicInfo", () => ({
  useRequireBasicInfo,
}));
vi.mock("@/features/draft/hooks/useUpdateDraftTexts", () => ({
  useUpdateDraftTexts,
}));
vi.mock("@/features/template/hooks/useTemplate", () => ({ useTemplate }));
vi.mock("@/features/template/hooks/useTemplateTextElements", () => ({
  useTemplateTextElements,
}));
vi.mock("@/features/draft/components/DraftPreviewProvider", () => ({
  useDraftPreviewContext,
  DraftPreviewBinding: () => null,
}));

function setup({
  draftTexts = [],
  activeElementName = null,
  draftId = "draft-1",
}: {
  draftTexts?: { name: string; text: string }[];
  activeElementName?: string | null;
  draftId?: string | null;
} = {}) {
  const mutate = vi.fn().mockResolvedValue(undefined);
  const createDraft = vi.fn();
  const setDraftId = vi.fn();
  const selectElement = vi.fn();
  const push = vi.fn();

  useRouter.mockReturnValue({ push });
  useDraftId.mockReturnValue({ draftId, setDraftId });
  useCreateDraft.mockReturnValue({ mutate: createDraft });
  useDraft.mockReturnValue(
    draftId
      ? { data: { id: draftId, texts: draftTexts }, isLoading: false }
      : { data: undefined, isLoading: false },
  );
  useUpdateDraftTexts.mockReturnValue({ mutateAsync: mutate });
  useTemplate.mockReturnValue({
    data: { id: "template-1", name: "하루 템플릿" },
  });
  useTemplateTextElements.mockReturnValue({
    data: [
      { type: "기본정보", name: "상호명", text: "하루" },
      { type: "자막", name: "1", text: "첫 장면" },
    ],
    isLoading: false,
  });
  useDraftPreviewContext.mockReturnValue({
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

  return { mutate, createDraft, setDraftId, selectElement, push };
}

describe("DraftSubtitleStep", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("기본정보 완료 여부를 확인한다", () => {
    setup();

    render(<DraftSubtitleStep templateId="template-1" prevHref="/prev" />);

    expect(useRequireBasicInfo).toHaveBeenCalledWith("template-1");
  });

  it("자막 스텝에서는 기본정보 입력을 보여주지 않는다", () => {
    setup();

    render(<DraftSubtitleStep templateId="template-1" prevHref="/prev" />);

    expect(screen.getByPlaceholderText("첫 장면")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("하루")).not.toBeInTheDocument();
  });

  it("입력할 때마다(디바운스 후) 서버에 자동 저장한다", async () => {
    const { mutate } = setup({
      draftTexts: [{ name: "상호명", text: "철수네 사진관" }],
    });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<DraftSubtitleStep templateId="template-1" prevHref="/prev" />);
    await user.type(screen.getByPlaceholderText("첫 장면"), "안녕");
    await vi.advanceTimersByTimeAsync(500);

    expect(mutate).toHaveBeenCalledWith({
      draftId: "draft-1",
      texts: [
        { type: "기본정보", name: "상호명", text: "철수네 사진관" },
        { type: "자막", name: "1", text: "안녕" },
      ],
    });
  });

  it("시안이 없으면 시안을 만들지 않고 입력창도 보여주지 않는다", async () => {
    const { createDraft, mutate } = setup({ draftId: null });

    render(<DraftSubtitleStep templateId="template-1" prevHref="/prev" />);
    await vi.advanceTimersByTimeAsync(1000);

    expect(createDraft).not.toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText("첫 장면")).not.toBeInTheDocument();
  });

  it("자막 입력칸에 포커스하면 미리보기를 해당 요소 위치로 이동시킨다", async () => {
    const { selectElement } = setup();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<DraftSubtitleStep templateId="template-1" prevHref="/prev" />);
    await user.click(screen.getByPlaceholderText("첫 장면"));

    expect(selectElement).toHaveBeenCalledWith("자막_1");
  });

  it("미리보기가 보여주는 자막 요소의 입력 옆에 미리보기 중을 보여준다", () => {
    setup({ activeElementName: "자막_1" });

    render(<DraftSubtitleStep templateId="template-1" prevHref="/prev" />);

    expect(screen.getByText("미리보기 중")).toBeInTheDocument();
  });

  it("자막은 비어 있어도 주문을 만들지 않고 결제 단계로 이동할 수 있다", async () => {
    const { push } = setup();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<DraftSubtitleStep templateId="template-1" prevHref="/prev" />);
    await user.click(screen.getByRole("button", { name: "다음: 결제" }));

    expect(toast.error).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/draft/template-1/payment"),
    );
  });

  it("다음 버튼으로 결제 단계로 넘어가면 결제 단계를 last_step으로 함께 보낸다", async () => {
    const { push, mutate } = setup();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<DraftSubtitleStep templateId="template-1" prevHref="/prev" />);
    await user.click(screen.getByRole("button", { name: "다음: 결제" }));

    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(mutate).toHaveBeenLastCalledWith(
      expect.objectContaining({ lastStep: "payment" }),
    );
  });
});
