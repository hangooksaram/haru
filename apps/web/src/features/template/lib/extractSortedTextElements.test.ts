import { describe, expect, it } from "vitest";

import { extractSortedTextElements } from "./extractSortedTextElements";

describe("extractSortedTextElements", () => {
  it("기본정보_ 접두사는 type: 기본정보, name은 라벨로 분리한다", () => {
    const elements = [{ type: "text", name: "기본정보_신랑 이름", text: "" }];

    expect(extractSortedTextElements(elements)).toEqual([
      { type: "기본정보", name: "신랑 이름", text: "" },
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
      { type: "text", name: "기본정보_B", text: "" },
      { type: "text", name: "자막_03", text: "" },
      { type: "text", name: "기본정보_A", text: "" },
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
      { type: "image", name: "기본정보_사진", source: "" },
      { type: "text", name: "기본정보_라벨", text: "" },
    ];

    expect(extractSortedTextElements(elements)).toEqual([
      { type: "기본정보", name: "라벨", text: "" },
    ]);
  });

  it("text인 요소가 없으면 빈 배열을 반환한다", () => {
    expect(extractSortedTextElements([{ type: "image", name: "x", source: "" }])).toEqual(
      [],
    );
  });

  it("배열이 아니면 빈 배열을 반환한다", () => {
    expect(extractSortedTextElements(undefined)).toEqual([]);
    expect(extractSortedTextElements(null)).toEqual([]);
  });

  it("분류 문자열을 비교하기 전에 유니코드 정규화(NFC)와 공백을 제거한다", () => {
    const decomposed = "기본정보".normalize("NFD");
    const elements = [
      { type: "text", name: `${decomposed}_라벨`, text: "" },
      { type: "text", name: " 자막 _01", text: "" },
    ];

    expect(extractSortedTextElements(elements)).toEqual([
      { type: "기본정보", name: "라벨", text: "" },
      { type: "자막", name: "01", text: "" },
    ]);
  });

  it("이름에 구분자(_)가 없거나 알 수 없는 접두사는 무시한다", () => {
    const elements = [
      { type: "text", name: "라벨없음", text: "" },
      { type: "text", name: "기타_라벨", text: "" },
    ];

    expect(extractSortedTextElements(elements)).toEqual([]);
  });
});
