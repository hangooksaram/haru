import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DraftPreviewStep } from "./DraftPreviewStep";

const { useDraftId } = vi.hoisted(() => ({ useDraftId: vi.fn() }));
const { useDraft } = vi.hoisted(() => ({ useDraft: vi.fn() }));

vi.mock("@/features/draft/components/DraftIdProvider", () => ({ useDraftId }));
vi.mock("@/features/draft/hooks/useDraft", () => ({ useDraft }));

function setup() {
  useDraftId.mockReturnValue({ draftId: "draft-1" });
  useDraft.mockReturnValue({
    data: {
      id: "draft-1",
      templateId: "template-1",
      status: "editing",
      photoSlotCount: 3,
      photos: [{ id: "p1", position: 0, url: "https://example.com/p1.jpg" }],
      texts: [{ name: "신랑", text: "철수" }],
    },
    isLoading: false,
  });
}

describe("DraftPreviewStep", () => {
  it("수정하기를 누르기 전에는 수정 항목 목록을 보여주지 않는다", () => {
    setup();

    render(<DraftPreviewStep templateId="template-1" />);

    expect(screen.queryByRole("link", { name: "사진" })).not.toBeInTheDocument();
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
