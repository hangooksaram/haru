import { describe, expect, it } from "vitest";

import { trimBlankText } from "./trimBlankText";

describe("trimBlankText", () => {
  it("일반 공백을 앞뒤에서 제거한다", () => {
    expect(trimBlankText("  안녕  ")).toBe("안녕");
  });

  it("탭과 줄바꿈도 제거한다", () => {
    expect(trimBlankText("\t안녕\n")).toBe("안녕");
  });

  it("전각 공백을 제거한다", () => {
    expect(trimBlankText("　안녕　")).toBe("안녕");
  });

  it("제로폭 공백만 있으면 빈 문자열이 된다", () => {
    expect(trimBlankText("​")).toBe("");
  });

  it("한글 채움 문자만 있으면 빈 문자열이 된다", () => {
    expect(trimBlankText("ᅟᅠㅤﾠ")).toBe("");
  });

  it("보이지 않는 문자와 일반 공백이 섞여 있어도 빈 문자열이 된다", () => {
    expect(trimBlankText("  ​ ㅤ  ")).toBe("");
  });

  it("문자열 중간의 제로폭 공백은 지우지 않는다", () => {
    expect(trimBlankText("안​녕")).toBe("안​녕");
  });
});
