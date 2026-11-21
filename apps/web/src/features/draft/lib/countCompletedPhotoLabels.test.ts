import { describe, expect, it } from "vitest";

import { countCompletedPhotoLabels } from "./countCompletedPhotoLabels";

describe("countCompletedPhotoLabels", () => {
  it("단독 라벨은 슬롯 하나만 채워지면 완료로 센다", () => {
    const groups = [
      { label: "신랑신부", slotNames: ["신랑신부"] },
      { label: "가족사진", slotNames: ["가족사진"] },
    ];

    expect(countCompletedPhotoLabels(groups, ["신랑신부"])).toBe(1);
  });

  it("여러 슬롯을 가진 라벨은 전부 채워져야 완료로 센다", () => {
    const groups = [
      { label: "아기돌사진", slotNames: ["아기돌사진_01", "아기돌사진_02"] },
    ];

    expect(countCompletedPhotoLabels(groups, ["아기돌사진_01"])).toBe(0);
    expect(
      countCompletedPhotoLabels(groups, ["아기돌사진_01", "아기돌사진_02"]),
    ).toBe(1);
  });

  it("아무것도 채워지지 않으면 0을 반환한다", () => {
    const groups = [{ label: "신랑신부", slotNames: ["신랑신부"] }];

    expect(countCompletedPhotoLabels(groups, [])).toBe(0);
  });
});
