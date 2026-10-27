import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DraftPreviewStep } from "./DraftPreviewStep";

const { useDraftId } = vi.hoisted(() => ({ useDraftId: vi.fn() }));
const { useDraft } = vi.hoisted(() => ({ useDraft: vi.fn() }));
const { useTemplateTextElements } = vi.hoisted(() => ({
  useTemplateTextElements: vi.fn(),
}));
const { useStoredDraftTexts } = vi.hoisted(() => ({
  useStoredDraftTexts: vi.fn(),
}));

vi.mock("@/features/draft/components/DraftIdProvider", () => ({ useDraftId }));
vi.mock("@/features/draft/hooks/useDraft", () => ({ useDraft }));
vi.mock("@/features/template/hooks/useTemplateTextElements", () => ({
  useTemplateTextElements,
}));
vi.mock("@/features/draft/hooks/useStoredDraftTexts", () => ({
  useStoredDraftTexts,
}));

function setup() {
  useDraftId.mockReturnValue({ draftId: "draft-1" });
  useDraft.mockReturnValue({
    data: {
      id: "draft-1",
      templateId: "template-1",
      status: "editing",
      photos: [
        { id: "p1", name: "사진1", position: 0, url: "https://example.com/p1.jpg" },
      ],
      texts: [],
    },
    isLoading: false,
  });
  useTemplateTextElements.mockReturnValue({
    data: [{ type: "기본정보", name: "신랑", text: "" }],
    isLoading: false,
  });
  useStoredDraftTexts.mockReturnValue({
    values: { 기본정보_신랑: "철수" },
    setValue: vi.fn(),
    clear: vi.fn(),
  });
}

describe("DraftPreviewStep", () => {
  it("수정하기를 누르기 전에는 수정 항목 목록을 보여주지 않는다", () => {
    setup();

    render(<DraftPreviewStep templateId="template-1" />);

    expect(
      screen.queryByRole("link", { name: "사진" }),
    ).not.toBeInTheDocument();
  });

  it("수정하기를 누르면 템플릿·사진·텍스트로 이동하는 링크가 나타난다", async () => {
    setup();
    const user = userEvent.setup();

    render(<DraftPreviewStep templateId="template-1" />);
    await user.click(screen.getByRole("button", { name: "수정하기" }));

    expect(screen.getByRole("link", { name: "템플릿" })).toHaveAttribute(
      "href",
      "/templates",
    );
    expect(screen.getByRole("link", { name: "사진" })).toHaveAttribute(
      "href",
      "/draft/template-1/photos?return=preview",
    );
    expect(screen.getByRole("link", { name: "텍스트" })).toHaveAttribute(
      "href",
      "/draft/template-1/text?return=preview",
    );
  });

  it("수정 항목은 입력 필드가 아니라 이동 링크다", async () => {
    setup();
    const user = userEvent.setup();

    render(<DraftPreviewStep templateId="template-1" />);
    await user.click(screen.getByRole("button", { name: "수정하기" }));

    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
  });

  it("이 시안으로 주문 버튼은 결제 단계로 이동한다", () => {
    setup();

    render(<DraftPreviewStep templateId="template-1" />);

    expect(
      screen.getByRole("link", { name: "이 시안으로 주문" }),
    ).toHaveAttribute("href", "/draft/template-1/payment");
  });
});
