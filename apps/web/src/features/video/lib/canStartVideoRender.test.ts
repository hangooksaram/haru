import { describe, expect, it } from "vitest";

import { canStartVideoRender } from "./canStartVideoRender";

describe("canStartVideoRender", () => {
  it("결제완료(paid) 주문만 제작을 시작할 수 있다", () => {
    expect(canStartVideoRender("paid")).toBe(true);
    expect(canStartVideoRender("pending_payment")).toBe(false);
    expect(canStartVideoRender("canceled")).toBe(false);
  });
});
