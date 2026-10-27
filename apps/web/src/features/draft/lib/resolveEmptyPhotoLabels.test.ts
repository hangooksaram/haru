import { describe, expect, it } from "vitest";

import { resolveEmptyPhotoLabels } from "./resolveEmptyPhotoLabels";

describe("resolveEmptyPhotoLabels", () => {
  it("채워지지 않은 라벨을 템플릿 순서대로 반환한다", () => {
    const labels = ["신랑신부", "가족사진", "커플사진"];

    expect(resolveEmptyPhotoLabels(labels, ["가족사진"])).toEqual([
      "신랑신부",
      "커플사진",
    ]);
  });

  it("모두 채워져 있으면 빈 배열을 반환한다", () => {
    const labels = ["신랑신부", "가족사진"];

    expect(resolveEmptyPhotoLabels(labels, ["신랑신부", "가족사진"])).toEqual(
      [],
    );
  });

  it("아무것도 채워지지 않았으면 전체 라벨을 반환한다", () => {
    const labels = ["신랑신부", "가족사진"];

    expect(resolveEmptyPhotoLabels(labels, [])).toEqual([
      "신랑신부",
      "가족사진",
    ]);
  });

  it("targetLabel을 지정하면 그 라벨을 맨 앞으로 보낸다", () => {
    const labels = ["신랑신부", "가족사진", "신부 얼굴"];

    expect(
      resolveEmptyPhotoLabels(labels, ["가족사진"], "신부 얼굴"),
    ).toEqual(["신부 얼굴", "신랑신부"]);
  });

  it("targetLabel이 이미 채워져 있으면 무시한다", () => {
    const labels = ["신랑신부", "가족사진"];

    expect(
      resolveEmptyPhotoLabels(labels, ["가족사진"], "가족사진"),
    ).toEqual(["신랑신부"]);
  });
});
