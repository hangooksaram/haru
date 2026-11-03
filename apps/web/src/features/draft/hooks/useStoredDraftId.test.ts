import { beforeEach, describe, expect, it } from "vitest";

import { findMigratableDraftId } from "@/features/draft/hooks/useStoredDraftId";

describe("findMigratableDraftId", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("다른 userId 키에 draftId가 하나만 있으면 그 키와 값을 반환한다", () => {
    localStorage.setItem("haru:draft:template-1:anon-1", "draft-abc");

    const result = findMigratableDraftId(
      "template-1",
      "haru:draft:template-1:real-1",
    );

    expect(result).toEqual({
      key: "haru:draft:template-1:anon-1",
      draftId: "draft-abc",
    });
  });

  it("값이 있는 다른 키가 여러 개면 모호하므로 null을 반환한다", () => {
    localStorage.setItem("haru:draft:template-1:anon-1", "draft-abc");
    localStorage.setItem("haru:draft:template-1:real-2", "draft-xyz");

    const result = findMigratableDraftId(
      "template-1",
      "haru:draft:template-1:real-1",
    );

    expect(result).toBeNull();
  });

  it("다른 templateId의 키는 무시한다", () => {
    localStorage.setItem("haru:draft:template-2:anon-1", "draft-other");

    const result = findMigratableDraftId(
      "template-1",
      "haru:draft:template-1:real-1",
    );

    expect(result).toBeNull();
  });

  it("자기 자신의 키는 후보에서 제외한다", () => {
    localStorage.setItem("haru:draft:template-1:real-1", "draft-self");

    const result = findMigratableDraftId(
      "template-1",
      "haru:draft:template-1:real-1",
    );

    expect(result).toBeNull();
  });

  it("후보 키가 없으면 null을 반환한다", () => {
    const result = findMigratableDraftId(
      "template-1",
      "haru:draft:template-1:real-1",
    );

    expect(result).toBeNull();
  });
});
