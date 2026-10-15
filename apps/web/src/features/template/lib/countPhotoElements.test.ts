import { describe, expect, it } from "vitest";

import { countPhotoElements } from "./countPhotoElements";

describe("countPhotoElements", () => {
  it("type이 image인 요소만 센다", () => {
    const elements = [
      { type: "image" },
      { type: "text" },
      { type: "image" },
    ];

    expect(countPhotoElements(elements)).toBe(2);
  });

  it("배열이 아니면 0을 반환한다", () => {
    expect(countPhotoElements(undefined)).toBe(0);
    expect(countPhotoElements(null)).toBe(0);
    expect(countPhotoElements("elements")).toBe(0);
  });

  it("빈 배열이면 0을 반환한다", () => {
    expect(countPhotoElements([])).toBe(0);
  });

  it("형식이 깨진 요소는 무시한다", () => {
    const elements = [null, 42, "image", { type: "image" }];

    expect(countPhotoElements(elements)).toBe(1);
  });
});
