import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DraftPreviewStep } from "./DraftPreviewStep";

const { useRouter } = vi.hoisted(() => ({ useRouter: vi.fn() }));
const { useDraftId } = vi.hoisted(() => ({ useDraftId: vi.fn() }));
const { useDraft } = vi.hoisted(() => ({ useDraft: vi.fn() }));
const { useTemplateTextElements } = vi.hoisted(() => ({
  useTemplateTextElements: vi.fn(),
}));
const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));
const { useCreateOrderFromDraft } = vi.hoisted(() => ({
  useCreateOrderFromDraft: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter }));
vi.mock("@/features/draft/components/DraftIdProvider", () => ({ useDraftId }));
vi.mock("@/features/draft/hooks/useDraft", () => ({ useDraft }));
vi.mock("@/features/template/hooks/useTemplateTextElements", () => ({
  useTemplateTextElements,
}));
vi.mock("@/features/order/hooks/useCreateOrderFromDraft", () => ({
  useCreateOrderFromDraft,
}));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { getUser } }),
}));

function setup({ isAnonymous = false }: { isAnonymous?: boolean } = {}) {
  const push = vi.fn();
  const mutateAsync = vi.fn().mockResolvedValue({ id: "order-1" });
  useRouter.mockReturnValue({ push });
  getUser.mockResolvedValue({ data: { user: { is_anonymous: isAnonymous } } });
  useDraftId.mockReturnValue({ draftId: "draft-1" });
  useDraft.mockReturnValue({
    data: {
      id: "draft-1",
      templateId: "template-1",
      status: "editing",
      photos: [
        { id: "p1", name: "사진1", position: 0, url: "https://example.com/p1.jpg" },
      ],
      texts: [{ name: "기본정보_신랑", text: "철수" }],
    },
    isLoading: false,
  });
  useTemplateTextElements.mockReturnValue({
    data: [{ type: "기본정보", name: "신랑", text: "" }],
    isLoading: false,
  });
  useCreateOrderFromDraft.mockReturnValue({ mutateAsync, isPending: false });

  return { push, mutateAsync };
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

  it("로그인한 유저가 이 시안으로 주문을 누르면 주문을 생성하고 결제 단계로 이동한다", async () => {
    const { push, mutateAsync } = setup({ isAnonymous: false });
    const user = userEvent.setup();

    render(<DraftPreviewStep templateId="template-1" />);
    await user.click(screen.getByRole("button", { name: "이 시안으로 주문" }));

    expect(mutateAsync).toHaveBeenCalledWith("draft-1");
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        "/draft/template-1/payment?orderId=order-1",
      ),
    );
  });

  it("익명 유저가 이 시안으로 주문을 누르면 결제 단계로 돌아올 로그인 화면으로 이동한다", async () => {
    const { push } = setup({ isAnonymous: true });
    const user = userEvent.setup();

    render(<DraftPreviewStep templateId="template-1" />);
    await user.click(screen.getByRole("button", { name: "이 시안으로 주문" }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        `/login?next=${encodeURIComponent("/draft/template-1/payment")}`,
      ),
    );
  });
});
