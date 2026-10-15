import { describe, expect, it } from "vitest";

import { extractUniqueTags } from "./extractUniqueTags";

describe("extractUniqueTags", () => {
  it("여러 템플릿의 태그를 중복 없이 합친다", () => {
    const result = extractUniqueTags([
      ["결혼", "돌잔치"],
      ["결혼"],
      ["생일"],
    ]);

    expect(result).toEqual(["결혼", "돌잔치", "생일"]);
  });

  it("입력이 없으면 빈 배열을 반환한다", () => {
    expect(extractUniqueTags([])).toEqual([]);
  });
});
