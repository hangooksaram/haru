import { describe, expect, it } from "vitest";

import { firstEmptySlotName } from "./firstEmptySlotName";

describe("firstEmptySlotName", () => {
  it("빈 슬롯이 있으면 그 중 첫 번째 슬롯 이름을 반환한다", () => {
    const slots = [
      { name: "아기돌사진_01", photo: { id: "p1" } },
      { name: "아기돌사진_02", photo: null },
      { name: "아기돌사진_03", photo: null },
    ];

    expect(firstEmptySlotName(slots)).toBe("아기돌사진_02");
  });

  it("빈 슬롯이 없으면 undefined를 반환한다", () => {
    const slots = [
      { name: "상호명", photo: { id: "p1" } },
    ];

    expect(firstEmptySlotName(slots)).toBeUndefined();
  });
});
