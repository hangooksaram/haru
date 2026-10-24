import { describe, expect, it } from "vitest";

import { removeLineBreaks } from "./removeLineBreaks";

describe("removeLineBreaks", () => {
  it("줄바꿈이 없으면 그대로 반환한다", () => {
    expect(removeLineBreaks("안녕하세요")).toBe("안녕하세요");
  });

  it("줄바꿈을 공백으로 치환한다", () => {
    expect(removeLineBreaks("안녕\n하세요")).toBe("안녕 하세요");
  });

  it("연속된 줄바꿈을 공백 하나로 치환한다", () => {
    expect(removeLineBreaks("안녕\r\n\r\n하세요")).toBe("안녕 하세요");
  });
});
