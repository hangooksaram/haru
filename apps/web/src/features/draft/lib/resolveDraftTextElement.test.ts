import { describe, expect, it } from "vitest";

import { resolveDraftTextElement } from "./resolveDraftTextElement";

import type { TemplateTextElement } from "@/features/template/types";

const templateTextElements: TemplateTextElement[] = [
  { type: "기본정보", name: "상호명", text: "하루 스튜디오" },
  { type: "자막", name: "1", text: "Your Logo" },
];

describe("resolveDraftTextElement", () => {
  it("템플릿에 존재하는 type+name 조합이면 결합된 이름과 type을 반환한다", () => {
    expect(
      resolveDraftTextElement("기본정보", "상호명", templateTextElements),
    ).toEqual({
      name: "기본정보_상호명",
      type: "기본정보",
    });
  });

  it("type에 공백이 섞여 있어도 정규화해 매칭한다", () => {
    expect(
      resolveDraftTextElement("기본 정보", "상호명", templateTextElements),
    ).toEqual({
      name: "기본정보_상호명",
      type: "기본정보",
    });
  });

  it("템플릿에 없는 name이면 null을 반환한다", () => {
    expect(
      resolveDraftTextElement("기본정보", "주소", templateTextElements),
    ).toBeNull();
  });

  it("알 수 없는 type이면 null을 반환한다", () => {
    expect(
      resolveDraftTextElement("제목", "상호명", templateTextElements),
    ).toBeNull();
  });
});
