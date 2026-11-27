import { describe, expect, it } from "vitest";

import { decideOrderCreationAction } from "./decideOrderCreationAction";

describe("decideOrderCreationAction", () => {
  it("연결된 주문이 대기면 재사용한다", () => {
    expect(decideOrderCreationAction("pending_payment")).toBe("reuse");
  });

  it("연결된 주문이 결제완료(대기가 아님)면 새로 만든다", () => {
    expect(decideOrderCreationAction("paid")).toBe("create");
  });

  it("연결된 주문이 없으면 새로 만든다", () => {
    expect(decideOrderCreationAction(null)).toBe("create");
  });
});
