import { describe, expect, it } from "vitest";

import { extractSortedTextElements } from "./extractSortedTextElements";

describe("extractSortedTextElements", () => {
  it("텍스트의 {{placeholder}}는 type: 기본정보, name은 placeholder 이름으로 분리한다", () => {
    const elements = [{ type: "text", name: "Title", text: "{{신랑 이름}}" }];

    expect(extractSortedTextElements(elements)).toEqual([
      { type: "기본정보", name: "신랑 이름", text: "" },
    ]);
  });

  it("한 텍스트의 여러 placeholder와 |기본값 문법을 이름만 추출한다", () => {
    const elements = [
      { type: "text", name: "Title", text: "{{신랑}} ♥ {{신부|기본값}}" },
    ];

    expect(extractSortedTextElements(elements)).toEqual([
      { type: "기본정보", name: "신랑", text: "" },
      { type: "기본정보", name: "신부", text: "" },
    ]);
  });

  it("여러 요소에 같은 placeholder가 있으면 한 번만 추출한다", () => {
    const elements = [
      { type: "text", name: "A", text: "{{신랑}}" },
      { type: "text", name: "B", text: "{{신랑}} {{신부}}" },
    ];

    expect(extractSortedTextElements(elements)).toEqual([
      { type: "기본정보", name: "신랑", text: "" },
      { type: "기본정보", name: "신부", text: "" },
    ]);
  });

  it("자막_ 접두사는 type: 자막, name은 번호로 분리한다", () => {
    const elements = [{ type: "text", name: "자막_01", text: "안녕하세요" }];

    expect(extractSortedTextElements(elements)).toEqual([
      { type: "자막", name: "01", text: "안녕하세요" },
    ]);
  });

  it("자막은 번호 오름차순으로 정렬하고, 기본정보는 원래 순서를 유지한다", () => {
    const elements = [
      { type: "text", name: "A", text: "{{B}}" },
      { type: "text", name: "자막_03", text: "" },
      { type: "text", name: "C", text: "{{A}}" },
      { type: "text", name: "자막_01", text: "" },
      { type: "text", name: "자막_02", text: "" },
    ];

    expect(extractSortedTextElements(elements)).toEqual([
      { type: "기본정보", name: "B", text: "" },
      { type: "자막", name: "01", text: "" },
      { type: "기본정보", name: "A", text: "" },
      { type: "자막", name: "02", text: "" },
      { type: "자막", name: "03", text: "" },
    ]);
  });

  it("type이 text가 아닌 요소는 제외한다", () => {
    const elements = [
      { type: "image", name: "사진", source: "{{사진}}" },
      { type: "text", name: "T", text: "{{라벨}}" },
    ];

    expect(extractSortedTextElements(elements)).toEqual([
      { type: "기본정보", name: "라벨", text: "" },
    ]);
  });

  it("text인 요소가 없으면 빈 배열을 반환한다", () => {
    expect(
      extractSortedTextElements([{ type: "image", name: "x", source: "" }]),
    ).toEqual([]);
  });

  it("배열이 아니면 빈 배열을 반환한다", () => {
    expect(extractSortedTextElements(undefined)).toEqual([]);
    expect(extractSortedTextElements(null)).toEqual([]);
  });

  it("자막 접두사를 비교하기 전에 유니코드 정규화(NFC)와 공백을 제거한다", () => {
    const elements = [{ type: "text", name: " 자막 _01", text: "" }];

    expect(extractSortedTextElements(elements)).toEqual([
      { type: "자막", name: "01", text: "" },
    ]);
  });

  it("placeholder가 없고 알 수 없는 접두사인 텍스트는 무시한다", () => {
    const elements = [
      { type: "text", name: "라벨없음", text: "고정 문구" },
      { type: "text", name: "기타_라벨", text: "" },
    ];

    expect(extractSortedTextElements(elements)).toEqual([]);
  });
});
