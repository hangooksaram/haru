import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PurchasedOrderCard } from "./PurchasedOrderCard";

import type { PurchasedOrderVideo } from "@/features/video/types";

const baseOrder: PurchasedOrderVideo = {
  id: "order-1",
  templateId: "template-1",
  templateName: "프로포즈",
  purchasedAt: new Date("2026-11-01"),
  renderStatus: "completed",
  finalVideoUrl: "https://example.com/video.mp4",
};

describe("PurchasedOrderCard", () => {
  it("제작이 끝났으면 눌러서 재생할 수 있고 다운로드 버튼을 보여준다", async () => {
    const user = userEvent.setup();
    render(<PurchasedOrderCard order={baseOrder} />);

    const playButton = screen.getByRole("button");
    expect(playButton).toBeEnabled();

    await user.click(playButton);

    expect(screen.getByRole("link", { name: "다운로드" })).toHaveAttribute(
      "href",
      "https://example.com/video.mp4",
    );
  });

  it("제작이 끝나지 않았으면 재생·다운로드를 비활성화하고 상태를 보여준다", () => {
    render(
      <PurchasedOrderCard
        order={{ ...baseOrder, renderStatus: "rendering", finalVideoUrl: null }}
      />,
    );

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText("영상 제작 중")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "다운로드" }),
    ).not.toBeInTheDocument();
  });

  it("제작에 실패했으면 실패 상태를 보여준다", () => {
    render(
      <PurchasedOrderCard
        order={{ ...baseOrder, renderStatus: "failed", finalVideoUrl: null }}
      />,
    );

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText("영상 제작 실패")).toBeInTheDocument();
  });
});
