import { describe, expect, it } from "vitest";

import { filterTemplates } from "./filterTemplates";

import type { Template } from "@/features/template/types";

function createTemplate(override: Partial<Template>): Template {
  return {
    id: "1",
    name: "청첩장",
    price: 10000,
    tags: ["결혼"],
    duration: 30,
    photoCount: 5,
    ...override,
  };
}

describe("filterTemplates", () => {
  const templates = [
    createTemplate({ id: "1", name: "청첩장", tags: ["결혼"] }),
    createTemplate({ id: "2", name: "돌잔치 초대장", tags: ["돌잔치"] }),
    createTemplate({ id: "3", name: "생일 축하", tags: ["생일"] }),
  ];

  it("태그와 검색어가 없으면 전체를 반환한다", () => {
    expect(filterTemplates(templates, null, "")).toEqual(templates);
  });

  it("선택한 태그를 포함한 템플릿만 반환한다", () => {
    const result = filterTemplates(templates, "결혼", "");

    expect(result.map((t) => t.id)).toEqual(["1"]);
  });

  it("이름에 검색어가 포함된 템플릿만 반환한다", () => {
    const result = filterTemplates(templates, null, "초대장");

    expect(result.map((t) => t.id)).toEqual(["2"]);
  });

  it("태그와 검색어를 동시에 적용한다", () => {
    const result = filterTemplates(templates, "돌잔치", "초대장");

    expect(result.map((t) => t.id)).toEqual(["2"]);
  });

  it("검색어 앞뒤 공백은 무시한다", () => {
    const result = filterTemplates(templates, null, "  청첩장  ");

    expect(result.map((t) => t.id)).toEqual(["1"]);
  });

  it("일치하는 템플릿이 없으면 빈 배열을 반환한다", () => {
    expect(filterTemplates(templates, "결혼", "돌잔치")).toEqual([]);
  });
});
