import { describe, expect, it } from "vitest";

import { computePhotoResize } from "./computePhotoResize";

describe("computePhotoResize", () => {
  it("긴 변이 1920px 이하이면 원본 크기를 유지한다", () => {
    const result = computePhotoResize(1600, 1200);

    expect(result.width).toBe(1600);
    expect(result.height).toBe(1200);
  });

  it("긴 변이 1920px을 초과하면 비율을 유지하며 1920px로 축소한다", () => {
    const result = computePhotoResize(3840, 2160);

    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
  });

  it("짧은 변이 720px 이상이면 흐림 경고가 없다", () => {
    const result = computePhotoResize(1600, 900);

    expect(result.isBlurryWarning).toBe(false);
  });

  it("짧은 변이 720px 미만이면 흐림 경고를 반환한다", () => {
    const result = computePhotoResize(1200, 600);

    expect(result.isBlurryWarning).toBe(true);
  });

  it("축소 후에도 짧은 변이 720px 미만이면 흐림 경고를 반환한다", () => {
    const result = computePhotoResize(4000, 1000);

    expect(result.width).toBe(1920);
    expect(result.isBlurryWarning).toBe(true);
  });
});
