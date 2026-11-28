import { describe, expect, it } from "vitest";

import { resolveDraftResumeStep } from "@/features/draft/lib/resolveDraftResumeStep";

const TEMPLATE_ELEMENTS = [
  { type: "text", name: "Title", text: "{{신랑}} ♥ {{신부}}" },
  { type: "text", name: "자막_1", text: "" },
  { type: "image", name: "Photo-1" },
  { type: "image", name: "Photo-2" },
];

const COMPLETE_TEXTS = [
  { name: "신랑", text: "길동" },
  { name: "신부", text: "춘향" },
];

describe("resolveDraftResumeStep", () => {
  it("필수 항목이 모두 채워져 있으면 last_step으로 이동한다", () => {
    expect(
      resolveDraftResumeStep({
        lastStep: "payment",
        templateElements: TEMPLATE_ELEMENTS,
        texts: COMPLETE_TEXTS,
        photoNames: ["Photo-1", "Photo-2"],
      }),
    ).toBe("payment");
  });

  it("last_step 이전 단계에 기본정보가 비어 있으면 기본정보로 이동한다", () => {
    expect(
      resolveDraftResumeStep({
        lastStep: "subtitle",
        templateElements: TEMPLATE_ELEMENTS,
        texts: [{ name: "신랑", text: "길동" }],
        photoNames: [],
      }),
    ).toBe("basic_info");
  });

  it("last_step 이전 단계에 사진이 비어 있으면 사진으로 이동한다", () => {
    expect(
      resolveDraftResumeStep({
        lastStep: "payment",
        templateElements: TEMPLATE_ELEMENTS,
        texts: COMPLETE_TEXTS,
        photoNames: ["Photo-1"],
      }),
    ).toBe("photos");
  });

  it("last_step 자신이나 그 뒤 단계의 빈 항목은 보지 않는다", () => {
    expect(
      resolveDraftResumeStep({
        lastStep: "photos",
        templateElements: TEMPLATE_ELEMENTS,
        texts: COMPLETE_TEXTS,
        photoNames: [],
      }),
    ).toBe("photos");
    expect(
      resolveDraftResumeStep({
        lastStep: "basic_info",
        templateElements: TEMPLATE_ELEMENTS,
        texts: [],
        photoNames: [],
      }),
    ).toBe("basic_info");
  });
});
