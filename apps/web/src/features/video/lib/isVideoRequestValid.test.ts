import { describe, expect, it } from "vitest";

import { isVideoRequestValid } from "./isVideoRequestValid";

describe("isVideoRequestValid", () => {
  it("valid이고 errors가 없으면 통과한다", () => {
    expect(isVideoRequestValid({ valid: true, errors: [] })).toBe(true);
  });

  it("valid가 false이면 통과하지 못한다", () => {
    expect(isVideoRequestValid({ valid: false, errors: [] })).toBe(false);
  });

  it("errors가 있으면 통과하지 못한다", () => {
    expect(isVideoRequestValid({ valid: true, errors: ["잘못된 값"] })).toBe(
      false,
    );
  });
});
