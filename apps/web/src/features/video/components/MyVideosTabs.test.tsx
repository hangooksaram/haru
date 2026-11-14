import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MyVideosTabs } from "./MyVideosTabs";

describe("MyVideosTabs", () => {
  it("작성 중 탭이 비어 있으면 안내와 템플릿 둘러보기 버튼을 보여준다", () => {
    render(
      <MyVideosTabs editingDrafts={[]} pendingOrders={[]} purchasedOrders={[]} />,
    );

    expect(screen.getByText("작성 중인 시안이 없어요.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "템플릿 둘러보기" }),
    ).toBeInTheDocument();
  });

  it("결제 대기·구매 완료 탭이 비어 있으면 템플릿 둘러보기 버튼 없이 안내만 보여준다", async () => {
    const user = userEvent.setup();
    render(
      <MyVideosTabs editingDrafts={[]} pendingOrders={[]} purchasedOrders={[]} />,
    );

    await user.click(screen.getByRole("tab", { name: "결제 대기" }));
    expect(screen.getByText("결제 대기 중인 주문이 없어요.")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "템플릿 둘러보기" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "구매 완료" }));
    expect(screen.getByText("구매한 영상이 없어요.")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "템플릿 둘러보기" }),
    ).not.toBeInTheDocument();
  });
});
