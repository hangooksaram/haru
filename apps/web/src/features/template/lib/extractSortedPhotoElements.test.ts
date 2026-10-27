import { describe, expect, it } from "vitest";

import { extractSortedPhotoElements } from "./extractSortedPhotoElements";

describe("extractSortedPhotoElements", () => {
  it("type이 image인 요소의 name을 배열 순서대로 추출한다", () => {
    const elements = [
      { type: "image", name: "신랑신부" },
      { type: "text", name: "기본정보_신랑 이름", text: "" },
      { type: "image", name: "가족사진" },
    ];

    expect(extractSortedPhotoElements(elements)).toEqual([
      "신랑신부",
      "가족사진",
    ]);
  });

  it("name이 문자열이 아닌 요소는 제외한다", () => {
    const elements = [{ type: "image", name: 1 }, { type: "image" }];

    expect(extractSortedPhotoElements(elements)).toEqual([]);
  });

  it("image 요소가 없으면 빈 배열을 반환한다", () => {
    expect(
      extractSortedPhotoElements([{ type: "text", name: "x", text: "" }]),
    ).toEqual([]);
  });

  it("배열이 아니면 빈 배열을 반환한다", () => {
    expect(extractSortedPhotoElements(undefined)).toEqual([]);
    expect(extractSortedPhotoElements(null)).toEqual([]);
  });
});
