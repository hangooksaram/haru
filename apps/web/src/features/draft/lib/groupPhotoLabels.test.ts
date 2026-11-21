import { describe, expect, it } from "vitest";

import { groupPhotoLabels } from "./groupPhotoLabels";

describe("groupPhotoLabels", () => {
  it("밑줄이 없는 이름은 그대로 단독 라벨이 된다", () => {
    expect(groupPhotoLabels(["신랑신부", "가족사진"])).toEqual([
      { label: "신랑신부", slotNames: ["신랑신부"] },
      { label: "가족사진", slotNames: ["가족사진"] },
    ]);
  });

  it("같은 프리픽스를 가진 요소를 한 라벨로 묶는다", () => {
    expect(groupPhotoLabels(["아기돌사진_01", "아기돌사진_02"])).toEqual([
      { label: "아기돌사진", slotNames: ["아기돌사진_01", "아기돌사진_02"] },
    ]);
  });

  it("숫자 서픽스는 숫자 순으로 정렬한다", () => {
    expect(
      groupPhotoLabels(["아기돌사진_02", "아기돌사진_01", "아기돌사진_10"]),
    ).toEqual([
      {
        label: "아기돌사진",
        slotNames: ["아기돌사진_01", "아기돌사진_02", "아기돌사진_10"],
      },
    ]);
  });

  it("숫자가 아닌 서픽스는 원래 순서를 유지한다", () => {
    expect(groupPhotoLabels(["가족사진_엄마", "가족사진_아빠"])).toEqual([
      { label: "가족사진", slotNames: ["가족사진_엄마", "가족사진_아빠"] },
    ]);
  });

  it("라벨 순서는 처음 등장한 템플릿 순서를 따른다", () => {
    expect(
      groupPhotoLabels(["신랑신부", "아기돌사진_01", "가족사진", "아기돌사진_02"]),
    ).toEqual([
      { label: "신랑신부", slotNames: ["신랑신부"] },
      { label: "아기돌사진", slotNames: ["아기돌사진_01", "아기돌사진_02"] },
      { label: "가족사진", slotNames: ["가족사진"] },
    ]);
  });

  it("빈 배열이면 빈 배열을 반환한다", () => {
    expect(groupPhotoLabels([])).toEqual([]);
  });
});
