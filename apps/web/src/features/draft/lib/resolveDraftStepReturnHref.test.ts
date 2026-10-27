import { describe, expect, it } from "vitest";

import { resolveDraftStepReturnHref } from "./resolveDraftStepReturnHref";

describe("resolveDraftStepReturnHref", () => {
  it("return 파라미터가 없으면 원래 다음 단계로 이동한다", () => {
    expect(
      resolveDraftStepReturnHref("t1", "/draft/t1/text", undefined),
    ).toBe("/draft/t1/text");
  });

  it("return=preview면 최종 미리보기로 바로 복귀한다", () => {
    expect(resolveDraftStepReturnHref("t1", "/draft/t1/text", "preview")).toBe(
      "/draft/t1/preview",
    );
  });

  it("return 값이 preview가 아니면 원래 다음 단계로 이동한다", () => {
    expect(resolveDraftStepReturnHref("t1", "/draft/t1/text", "other")).toBe(
      "/draft/t1/text",
    );
  });
});
