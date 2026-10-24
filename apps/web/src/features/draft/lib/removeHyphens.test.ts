import { describe, expect, it } from "vitest";

import { removeHyphens } from "./removeHyphens";

describe("removeHyphens", () => {
  it("하이픈이 없으면 그대로 반환한다", () => {
    expect(removeHyphens("안녕하세요")).toBe("안녕하세요");
  });

  it("하이픈을 공백으로 치환한다", () => {
    expect(removeHyphens("제목-부제")).toBe("제목 부제");
  });
});
