import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PaymentStep } from "./PaymentStep";

const { useDraftId } = vi.hoisted(() => ({ useDraftId: vi.fn() }));
const { useDraft } = vi.hoisted(() => ({ useDraft: vi.fn() }));
const { useTemplate } = vi.hoisted(() => ({ useTemplate: vi.fn() }));

vi.mock("@/features/draft/components/DraftIdProvider", () => ({ useDraftId }));
vi.mock("@/features/draft/hooks/useDraft", () => ({ useDraft }));
vi.mock("@/features/template/hooks/useTemplate", () => ({ useTemplate }));
vi.mock("@/features/draft/components/DraftVideoPreview", () => ({
  DraftVideoPreview: () => <div data-testid="video-preview" />,
}));
vi.mock("@/features/order/components/OrderPaymentSummary", () => ({
  OrderPaymentSummary: () => null,
}));
vi.mock("./PaymentWidget", () => ({
  PaymentWidget: () => <div data-testid="payment-widget" />,
}));

function setup() {
  useDraftId.mockReturnValue({ draftId: "draft-1" });
  useDraft.mockReturnValue({
    data: { id: "draft-1", photos: [], texts: [] },
    isLoading: false,
  });
  useTemplate.mockReturnValue({
    data: { id: "template-1", name: "하루 템플릿" },
  });
}

describe("PaymentStep", () => {
  it("결제 스텝에서 전체 영상을 미리 볼 수 있다", () => {
    setup();

    render(<PaymentStep templateId="template-1" orderId="order-1" />);

    expect(screen.getByTestId("video-preview")).toBeInTheDocument();
  });

  it("수정할 항목(템플릿·기본정보·사진·자막)을 골라 해당 단계로 이동한다", async () => {
    setup();
    const user = userEvent.setup();

    render(<PaymentStep templateId="template-1" orderId="order-1" />);
    await user.click(screen.getByRole("button", { name: "수정하기" }));

    expect(screen.getByRole("menuitem", { name: "템플릿" })).toHaveAttribute(
      "href",
      "/templates",
    );
    expect(screen.getByRole("menuitem", { name: "기본정보" })).toHaveAttribute(
      "href",
      "/draft/template-1/basic-info?return=payment",
    );
    expect(screen.getByRole("menuitem", { name: "사진" })).toHaveAttribute(
      "href",
      "/draft/template-1/photos?return=payment",
    );
    expect(screen.getByRole("menuitem", { name: "자막" })).toHaveAttribute(
      "href",
      "/draft/template-1/subtitle",
    );
  });

  it("결제 스텝에서 직접 수정하지 않는다", async () => {
    setup();
    const user = userEvent.setup();

    render(<PaymentStep templateId="template-1" orderId="order-1" />);
    await user.click(screen.getByRole("button", { name: "수정하기" }));

    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
  });

  it("결제하기를 누르기 전에는 결제 위젯이 보이지 않고, 누르면 모달로 열린다", async () => {
    setup();
    const user = userEvent.setup();

    render(<PaymentStep templateId="template-1" orderId="order-1" />);

    expect(screen.queryByTestId("payment-widget")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "결제하기" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("payment-widget")).toBeInTheDocument();
  });
});
