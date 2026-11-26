import { describe, expect, it } from "vitest";

import { resolveTemplateLang } from "./resolveTemplateLang";

describe("resolveTemplateLang", () => {
  it("지원하는 언어 코드는 그대로 쓴다", () => {
    expect(resolveTemplateLang("ko")).toBe("ko");
    expect(resolveTemplateLang("en")).toBe("en");
  });

  it("없거나 지원하지 않는 값이면 ko로 본다", () => {
    expect(resolveTemplateLang(null)).toBe("ko");
    expect(resolveTemplateLang("fr")).toBe("ko");
  });
});
