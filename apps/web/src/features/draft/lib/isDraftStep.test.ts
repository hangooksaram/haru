import { describe, expect, it } from "vitest";

import { isDraftStep } from "@/features/draft/lib/isDraftStep";

describe("isDraftStep", () => {
  it("시안 단계 값(basic_info, photos, subtitle, payment)만 허용한다", () => {
    expect(isDraftStep("basic_info")).toBe(true);
    expect(isDraftStep("photos")).toBe(true);
    expect(isDraftStep("subtitle")).toBe(true);
    expect(isDraftStep("payment")).toBe(true);
  });

  it("단계 값이 아니면 거부한다", () => {
    expect(isDraftStep("basic-info")).toBe(false);
    expect(isDraftStep("toString")).toBe(false);
    expect(isDraftStep(undefined)).toBe(false);
    expect(isDraftStep(1)).toBe(false);
  });
});
