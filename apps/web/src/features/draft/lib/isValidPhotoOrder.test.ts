import { describe, expect, it } from "vitest";

import { isValidPhotoOrder } from "./isValidPhotoOrder";

describe("isValidPhotoOrder", () => {
  it("기존 사진과 같은 집합을 순서만 바꿔 요청하면 유효하다", () => {
    expect(isValidPhotoOrder(["a", "b", "c"], ["c", "a", "b"])).toBe(true);
  });

  it("사진이 누락되면 유효하지 않다", () => {
    expect(isValidPhotoOrder(["a", "b", "c"], ["a", "b"])).toBe(false);
  });

  it("존재하지 않는 사진이 포함되면 유효하지 않다", () => {
    expect(isValidPhotoOrder(["a", "b", "c"], ["a", "b", "z"])).toBe(false);
  });
});
