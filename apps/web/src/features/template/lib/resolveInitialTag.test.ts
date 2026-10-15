import { describe, expect, it } from "vitest";

import { resolveInitialTag } from "./resolveInitialTag";

const TAG_OPTIONS = ["결혼", "돌잔치"];

describe("resolveInitialTag", () => {
  it("필터 목록에 있는 태그면 그대로 사용한다", () => {
    expect(resolveInitialTag("결혼", TAG_OPTIONS)).toBe("결혼");
  });

  it("필터 목록에 없는 태그면 무시한다", () => {
    expect(resolveInitialTag("생일", TAG_OPTIONS)).toBeNull();
  });

  it("태그가 없으면 무시한다", () => {
    expect(resolveInitialTag(undefined, TAG_OPTIONS)).toBeNull();
  });
});
