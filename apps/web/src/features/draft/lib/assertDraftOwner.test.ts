import { describe, expect, it } from "vitest";

import { DraftForbiddenError } from "@/features/draft/errors";

import { assertDraftOwner } from "./assertDraftOwner";

describe("assertDraftOwner", () => {
  it("소유자 본인의 요청은 허용한다", () => {
    expect(() =>
      assertDraftOwner("draft-1", "user-1", "user-1"),
    ).not.toThrow();
  });

  it("소유자가 아닌 유저의 요청은 거부한다", () => {
    expect(() => assertDraftOwner("draft-1", "user-1", "user-2")).toThrow(
      DraftForbiddenError,
    );
  });

  it("로그인하지 않은 유저가 남의 시안에 접근하면 거부한다", () => {
    expect(() => assertDraftOwner("draft-1", "user-1", null)).toThrow(
      DraftForbiddenError,
    );
  });

  it("소유자가 없는 시안(null)은 누구나 접근할 수 있다", () => {
    expect(() => assertDraftOwner("draft-1", null, "user-2")).not.toThrow();
    expect(() => assertDraftOwner("draft-1", null, null)).not.toThrow();
  });
});
