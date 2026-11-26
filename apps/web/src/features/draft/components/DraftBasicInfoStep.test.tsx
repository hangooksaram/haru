import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DraftBasicInfoStep } from "./DraftBasicInfoStep";

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
const { useTemplate } = vi.hoisted(() => ({ useTemplate: vi.fn() }));
const { useTemplateTextElements } = vi.hoisted(() => ({
  useTemplateTextElements: vi.fn(),
}));

vi.mock("sonner", () => ({ toast }));
vi.mock("next/navigation", () => ({ useRouter }));
vi.mock("@/features/draft/components/DraftIdProvider", () => ({ useDraftId }));
vi.mock("@/features/draft/hooks/useCreateDraft", () => ({ useCreateDraft }));
vi.mock("@/features/draft/hooks/useDraft", () => ({ useDraft }));
vi.mock("@/features/draft/hooks/useUpdateDraftTexts", () => ({
  useUpdateDraftTexts,
}));
vi.mock("@/features/template/hooks/useTemplate", () => ({ useTemplate }));
vi.mock("@/features/template/hooks/useTemplateTextElements", () => ({
  useTemplateTextElements,
}));
vi.mock("@/features/draft/components/DraftPreviewProvider", () => ({
  DraftPreviewBinding: () => null,
}));

function setup({
  draftTexts = [],
  draftId = "draft-1",
}: {
  draftTexts?: { name: string; text: string }[];
  draftId?: string | null;
} = {}) {
  const mutate = vi.fn().mockResolvedValue(undefined);
  const setDraftId = vi.fn();
  const createDraft = vi.fn(
    (
      _templateId: string,
      options: { onSuccess: (data: { id: string }) => void },
    ) => options.onSuccess({ id: "new-draft" }),
  );
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

  return { mutate, createDraft, setDraftId, push };
}

describe("DraftBasicInfoStep", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("입력할 때마다(디바운스 후) 서버에 자동 저장한다", async () => {
    const { mutate } = setup();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<DraftBasicInfoStep templateId="template-1" nextHref="/next" />);
    await user.type(screen.getByPlaceholderText("하루"), "철수네 사진관");

    expect(mutate).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith({
      draftId: "draft-1",
      texts: [
        { type: "기본정보", name: "상호명", text: "철수네 사진관" },
        { type: "자막", name: "1", text: "" },
      ],
    });
  });

  it("같은 시안에 다시 들어오면 서버에 자동 저장된 값을 입력창에 채운다", () => {
    setup({ draftTexts: [{ name: "상호명", text: "철수네 사진관" }] });

    render(<DraftBasicInfoStep templateId="template-1" nextHref="/next" />);

    expect(screen.getByPlaceholderText("하루")).toHaveValue("철수네 사진관");
  });

  it("복원한 값도 입력 검증(줄바꿈 제거)을 거친다", () => {
    setup({ draftTexts: [{ name: "상호명", text: "철수네\n사진관" }] });

    render(<DraftBasicInfoStep templateId="template-1" nextHref="/next" />);

    expect(screen.getByPlaceholderText("하루")).toHaveValue("철수네 사진관");
  });

  it("기본정보가 비어 있으면 그 항목만 제외하고 자동 저장한다", async () => {
    const { mutate } = setup({
      draftTexts: [{ name: "상호명", text: "철수네 사진관" }],
    });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<DraftBasicInfoStep templateId="template-1" nextHref="/next" />);
    await user.clear(screen.getByPlaceholderText("하루"));
    await vi.advanceTimersByTimeAsync(500);

    expect(mutate).toHaveBeenCalledWith({
      draftId: "draft-1",
      texts: [{ type: "자막", name: "1", text: "" }],
    });
  });

  it("기본정보를 모두 입력하지 않으면 다음으로 이동하지 않는다", async () => {
    const { push } = setup();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<DraftBasicInfoStep templateId="template-1" nextHref="/next" />);
    await user.click(screen.getByRole("button", { name: "다음: 사진" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "기본정보를 모두 입력해 주세요.",
      ),
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("기본정보를 모두 입력하면 저장한 뒤 다음으로 이동한다", async () => {
    const { push, mutate } = setup({
      draftTexts: [{ name: "상호명", text: "철수네 사진관" }],
    });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<DraftBasicInfoStep templateId="template-1" nextHref="/next" />);
    await user.click(screen.getByRole("button", { name: "다음: 사진" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/next"));
    expect(mutate).toHaveBeenCalledWith({
      draftId: "draft-1",
      texts: [
        { type: "기본정보", name: "상호명", text: "철수네 사진관" },
        { type: "자막", name: "1", text: "" },
      ],
    });
  });

  it("기본정보 스텝에서는 자막 입력을 보여주지 않는다", () => {
    setup();

    render(<DraftBasicInfoStep templateId="template-1" nextHref="/next" />);

    expect(screen.getByPlaceholderText("하루")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("첫 장면")).not.toBeInTheDocument();
  });

  it("시안이 없으면 화면에 들어올 때 시안을 한 번만 만들고, 만들어질 때까지 입력창을 보여주지 않는다", () => {
    const { createDraft, setDraftId } = setup({ draftId: null });

    const { rerender } = render(
      <DraftBasicInfoStep templateId="template-1" nextHref="/next" />,
    );
    rerender(<DraftBasicInfoStep templateId="template-1" nextHref="/next" />);

    expect(createDraft).toHaveBeenCalledTimes(1);
    expect(createDraft.mock.calls[0][0]).toBe("template-1");
    expect(setDraftId).toHaveBeenCalledWith("new-draft");
    expect(screen.queryByPlaceholderText("하루")).not.toBeInTheDocument();
  });

  it("시안이 이미 있으면 시안을 만들지 않는다", () => {
    const { createDraft } = setup();

    render(<DraftBasicInfoStep templateId="template-1" nextHref="/next" />);

    expect(createDraft).not.toHaveBeenCalled();
  });
});
