import { describe, expect, it } from "vitest";

import { decideOrderCreationAction } from "./decideOrderCreationAction";

describe("decideOrderCreationAction", () => {
  it("시안이 converted이고 연결된 주문이 대기면 재사용한다", () => {
    expect(decideOrderCreationAction("converted", "pending_payment")).toBe(
      "reuse",
    );
  });

  it("시안이 editing으로 돌아왔고 연결된 주문이 대기면 취소 후 새로 만든다", () => {
    expect(decideOrderCreationAction("editing", "pending_payment")).toBe(
      "cancel_and_create",
    );
  });

  it("연결된 주문이 결제완료(대기가 아님)면 새로 만든다", () => {
    expect(decideOrderCreationAction("converted", "paid")).toBe("create");
  });

  it("연결된 주문이 없으면 새로 만든다", () => {
    expect(decideOrderCreationAction("editing", null)).toBe("create");
  });
});
