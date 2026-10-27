import { describe, expect, it } from "vitest";

import { computePhotoSwap } from "./computePhotoSwap";

describe("computePhotoSwap", () => {
  it("두 라벨 모두 사진이 있으면 서로 자리를 바꾼다", () => {
    const photoA = { id: "photo-a", name: "신랑신부" };
    const photoB = { id: "photo-b", name: "가족사진" };

    expect(
      computePhotoSwap(photoA, photoB, "신랑신부", "가족사진"),
    ).toEqual([
      { id: "photo-a", name: "가족사진" },
      { id: "photo-b", name: "신랑신부" },
    ]);
  });

  it("상대 라벨이 비어 있으면 사진이 그 라벨로 옮겨가고 원래 라벨은 빈 상태가 된다", () => {
    const photoA = { id: "photo-a", name: "신랑신부" };

    expect(computePhotoSwap(photoA, null, "신랑신부", "가족사진")).toEqual([
      { id: "photo-a", name: "가족사진" },
    ]);
  });
});
