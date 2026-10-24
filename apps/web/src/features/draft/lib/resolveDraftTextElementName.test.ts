import { describe, expect, it } from "vitest";

import { resolveDraftTextElementName } from "./resolveDraftTextElementName";

import type { TemplateTextElement } from "@/features/template/types";

const templateTextElements: TemplateTextElement[] = [
  { type: "기본정보", name: "상호명", text: "" },
  { type: "자막", name: "1", text: "" },
];

describe("resolveDraftTextElementName", () => {
  it("템플릿에 존재하는 type+name 조합이면 결합된 이름을 반환한다", () => {
    expect(
      resolveDraftTextElementName("기본정보", "상호명", templateTextElements),
    ).toBe("기본정보_상호명");
  });

  it("type에 공백이 섞여 있어도 정규화해 매칭한다", () => {
    expect(
      resolveDraftTextElementName("기본 정보", "상호명", templateTextElements),
    ).toBe("기본정보_상호명");
  });

  it("템플릿에 없는 name이면 null을 반환한다", () => {
    expect(
      resolveDraftTextElementName("기본정보", "주소", templateTextElements),
    ).toBeNull();
  });

  it("알 수 없는 type이면 null을 반환한다", () => {
    expect(
      resolveDraftTextElementName("제목", "상호명", templateTextElements),
    ).toBeNull();
  });
});
