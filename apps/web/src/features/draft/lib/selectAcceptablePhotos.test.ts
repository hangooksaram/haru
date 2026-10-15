import { describe, expect, it } from "vitest";

import { selectAcceptablePhotos } from "./selectAcceptablePhotos";

describe("selectAcceptablePhotos", () => {
  it("남은 자리보다 적게 올리면 모두 허용한다", () => {
    const result = selectAcceptablePhotos(["a", "b"], 5, 1);

    expect(result.accepted).toEqual(["a", "b"]);
    expect(result.rejectedCount).toBe(0);
  });

  it("남은 자리만큼만 허용하고, 올린 순서를 유지한다", () => {
    const result = selectAcceptablePhotos(["a", "b", "c"], 5, 3);

    expect(result.accepted).toEqual(["a", "b"]);
    expect(result.rejectedCount).toBe(1);
  });

  it("이미 슬롯이 가득 찼으면 모두 거부한다", () => {
    const result = selectAcceptablePhotos(["a", "b"], 3, 3);

    expect(result.accepted).toEqual([]);
    expect(result.rejectedCount).toBe(2);
  });
});
