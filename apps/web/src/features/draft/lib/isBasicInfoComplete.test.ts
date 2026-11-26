import { describe, expect, it } from "vitest";

import { isBasicInfoComplete } from "./isBasicInfoComplete";

import type { TemplateTextElement } from "@/features/template/types";

const ELEMENTS: TemplateTextElement[] = [
  { type: "기본정보", name: "상호명", text: "하루" },
  { type: "기본정보", name: "전화번호", text: "010" },
  { type: "자막", name: "1", text: "첫 장면" },
];

describe("isBasicInfoComplete", () => {
  it("기본정보가 모두 저장돼 있으면 true다", () => {
    expect(
      isBasicInfoComplete(ELEMENTS, [
        { name: "상호명", text: "철수네" },
        { name: "전화번호", text: "010-1234" },
      ]),
    ).toBe(true);
  });

  it("기본정보가 하나라도 저장되지 않았으면 false다", () => {
    expect(
      isBasicInfoComplete(ELEMENTS, [{ name: "상호명", text: "철수네" }]),
    ).toBe(false);
  });

  it("기본정보가 공백뿐이면 비어 있는 것으로 본다", () => {
    expect(
      isBasicInfoComplete(ELEMENTS, [
        { name: "상호명", text: "철수네" },
        { name: "전화번호", text: "  " },
      ]),
    ).toBe(false);
  });

  it("자막이 비어 있어도 기본정보만 채워져 있으면 true다", () => {
    expect(
      isBasicInfoComplete(ELEMENTS, [
        { name: "상호명", text: "철수네" },
        { name: "전화번호", text: "010-1234" },
        { name: "자막_1", text: "" },
      ]),
    ).toBe(true);
  });
});
