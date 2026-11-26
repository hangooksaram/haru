import { describe, expect, it } from "vitest";

import { resolveTemplateSummary } from "./resolveTemplateSummary";

describe("resolveTemplateSummary", () => {
  it("요청 언어의 문구를 돌려준다", () => {
    expect(resolveTemplateSummary({ ko: "소개", en: "intro" }, "en")).toBe(
      "intro",
    );
  });

  it("요청 언어의 문구가 비어 있으면 ko 문구를 돌려준다", () => {
    expect(resolveTemplateSummary({ ko: "소개", en: "" }, "en")).toBe("소개");
    expect(resolveTemplateSummary({ ko: "소개" }, "en")).toBe("소개");
  });

  it("ko도 비어 있거나 summary가 없으면 null이다", () => {
    expect(resolveTemplateSummary({ ko: "", en: "" }, "en")).toBeNull();
    expect(resolveTemplateSummary(null, "ko")).toBeNull();
  });
});
