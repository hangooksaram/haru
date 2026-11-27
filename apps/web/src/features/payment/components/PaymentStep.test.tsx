import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PaymentStep } from "./PaymentStep";

const { useDraftId } = vi.hoisted(() => ({ useDraftId: vi.fn() }));
const { useDraft } = vi.hoisted(() => ({ useDraft: vi.fn() }));
const { useTemplate } = vi.hoisted(() => ({ useTemplate: vi.fn() }));
const { useCreateOrderWithGuestResume } = vi.hoisted(() => ({
  useCreateOrderWithGuestResume: vi.fn(),
}));

vi.mock("@/features/draft/components/DraftIdProvider", () => ({ useDraftId }));
vi.mock("@/features/draft/hooks/useDraft", () => ({ useDraft }));
vi.mock("@/features/template/hooks/useTemplate", () => ({ useTemplate }));
vi.mock("@/features/template/hooks/useTemplateTextElements", () => ({
  useTemplateTextElements: () => ({ data: [] }),
}));
vi.mock("@/features/draft/components/DraftVideoPreview", () => ({
  DraftVideoPreview: () => <div data-testid="video-preview" />,
}));
vi.mock("@/features/order/hooks/useCreateOrderWithGuestResume", () => ({
  useCreateOrderWithGuestResume,
}));
const { useVideoRequestValidation } = vi.hoisted(() => ({
  useVideoRequestValidation: vi.fn(),
}));

vi.mock("@/features/video/hooks/useVideoRequestValidation", () => ({
  useVideoRequestValidation,
}));
vi.mock("./PaymentWidget", () => ({
  PaymentWidget: () => <div data-testid="payment-widget" />,
}));

function setup() {
  const handleOrderClick = vi.fn();
  let onCreated: (orderId: string) => void = () => {};
  useCreateOrderWithGuestResume.mockImplementation(
    (_templateId: string, _path: string, callback: typeof onCreated) => {
      onCreated = callback;
      return { handleOrderClick, message: null, isPending: false };
    },
  );
  useDraftId.mockReturnValue({ draftId: "draft-1" });
  useDraft.mockReturnValue({
    data: { id: "draft-1", photos: [], texts: [] },
    isLoading: false,
  });
  useTemplate.mockReturnValue({
    data: { id: "template-1", name: "하루 템플릿", price: 10000 },
  });
  useVideoRequestValidation.mockReturnValue({
    data: { passed: true, errors: [] },
    isPending: false,
    isError: false,
  });

  return {
    handleOrderClick,
    createOrder: (orderId: string) => onCreated(orderId),
  };
}

describe("PaymentStep", () => {
  it("결제 스텝에서 전체 영상을 미리 볼 수 있다", () => {
    setup();

    render(<PaymentStep templateId="template-1" />);

    expect(screen.getByTestId("video-preview")).toBeInTheDocument();
  });

  it("수정할 항목(템플릿·기본정보·사진·자막)을 골라 해당 단계로 이동한다", () => {
    setup();

    render(<PaymentStep templateId="template-1" />);

    expect(screen.getByRole("link", { name: "템플릿 변경" })).toHaveAttribute(
      "href",
      "/templates",
    );
    expect(screen.getByRole("link", { name: "기본정보 수정" })).toHaveAttribute(
      "href",
      "/draft/template-1/basic-info?return=payment",
    );
    expect(screen.getByRole("link", { name: "사진 수정" })).toHaveAttribute(
      "href",
      "/draft/template-1/photos?return=payment",
    );
    expect(screen.getByRole("link", { name: "자막 수정" })).toHaveAttribute(
      "href",
      "/draft/template-1/subtitle",
    );
  });

  it("결제 스텝에서 직접 수정하지 않는다", () => {
    setup();

    render(<PaymentStep templateId="template-1" />);

    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
  });

  it("결제하기를 누르면 주문 생성을 요청하고, 주문 생성 응답을 받은 뒤에만 결제 UI를 모달로 연다", async () => {
    const { handleOrderClick, createOrder } = setup();
    const user = userEvent.setup();

    render(<PaymentStep templateId="template-1" />);

    expect(screen.queryByTestId("payment-widget")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "10,000원 결제하기" }));

    expect(handleOrderClick).toHaveBeenCalled();
    expect(screen.queryByTestId("payment-widget")).not.toBeInTheDocument();

    act(() => createOrder("order-1"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("payment-widget")).toBeInTheDocument();
  });

  it("입장하면 시안의 영상 요청 내용을 검증한다", () => {
    setup();

    render(<PaymentStep templateId="template-1" />);

    expect(useVideoRequestValidation).toHaveBeenCalledWith("draft-1");
  });

  it("검증 중에는 결제 화면 대신 확인 중 문구를 보여주고 결제하기를 막는다", () => {
    setup();
    useVideoRequestValidation.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    });

    render(<PaymentStep templateId="template-1" />);

    expect(screen.getByText(/확인하는 중/)).toBeInTheDocument();
    expect(screen.queryByTestId("video-preview")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "10,000원 결제하기" }),
    ).toBeDisabled();
  });

  it("검증에 실패하면 실패 이유(errors)를 그대로 보여준다", () => {
    setup();
    useVideoRequestValidation.mockReturnValue({
      data: { passed: false, errors: ["Title 길이 초과", "색상 값 오류"] },
      isPending: false,
      isError: false,
    });

    render(<PaymentStep templateId="template-1" />);

    expect(screen.getByText("Title 길이 초과")).toBeInTheDocument();
    expect(screen.getByText("색상 값 오류")).toBeInTheDocument();
  });

  it("결제 페이지는 주문 번호를 보여주지 않는다", () => {
    setup();

    render(<PaymentStep templateId="template-1" />);

    expect(screen.queryByText(/주문번호/)).not.toBeInTheDocument();
  });
});
