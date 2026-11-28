import { describe, expect, it } from "vitest";

import { isLaterDraftStep } from "@/features/draft/lib/isLaterDraftStep";

describe("isLaterDraftStep", () => {
  it("새 단계가 기존 last_step보다 뒤일 때만 갱신 대상이다", () => {
    expect(isLaterDraftStep("photos", "basic_info")).toBe(true);
    expect(isLaterDraftStep("payment", "subtitle")).toBe(true);
  });

  it("앞 단계나 같은 단계로는 last_step이 줄지 않는다", () => {
    expect(isLaterDraftStep("basic_info", "photos")).toBe(false);
    expect(isLaterDraftStep("subtitle", "subtitle")).toBe(false);
  });
});
