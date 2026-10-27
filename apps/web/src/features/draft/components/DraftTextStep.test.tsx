import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DraftTextStep } from "./DraftTextStep";

const { useRouter } = vi.hoisted(() => ({ useRouter: vi.fn() }));
const { useDraftId } = vi.hoisted(() => ({ useDraftId: vi.fn() }));
const { useCreateDraft } = vi.hoisted(() => ({ useCreateDraft: vi.fn() }));
const { useTemplateTextElements } = vi.hoisted(() => ({
  useTemplateTextElements: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter }));
vi.mock("@/features/draft/components/DraftIdProvider", () => ({ useDraftId }));
vi.mock("@/features/draft/hooks/useCreateDraft", () => ({ useCreateDraft }));
vi.mock("@/features/template/hooks/useTemplateTextElements", () => ({
  useTemplateTextElements,
}));

const STORAGE_KEY = "haru:draft-texts:draft-1";

function setup() {
  useRouter.mockReturnValue({ push: vi.fn() });
  useDraftId.mockReturnValue({ draftId: "draft-1", setDraftId: vi.fn() });
  useCreateDraft.mockReturnValue({ mutate: vi.fn() });
  useTemplateTextElements.mockReturnValue({
    data: [
      { type: "기본정보", name: "상호명", text: "하루" },
      { type: "자막", name: "1", text: "첫 장면" },
    ],
    isLoading: false,
  });
}

describe("DraftTextStep", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("입력할 때마다 시안별 localStorage에 임시 저장한다", async () => {
    setup();
    const user = userEvent.setup();

    render(
      <DraftTextStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );
    await user.type(screen.getByPlaceholderText("하루"), "철수네 사진관");

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")).toEqual({
      기본정보_상호명: "철수네 사진관",
    });
  });

  it("같은 시안에 다시 들어오면 임시 저장 값을 입력창에 채운다", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ 기본정보_상호명: "철수네 사진관" }),
    );
    setup();

    render(
      <DraftTextStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );

    expect(screen.getByPlaceholderText("하루")).toHaveValue("철수네 사진관");
  });

  it("복원한 값도 입력 검증(줄바꿈 제거)을 거친다", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ 기본정보_상호명: "철수네\n사진관" }),
    );
    setup();

    render(
      <DraftTextStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );

    expect(screen.getByPlaceholderText("하루")).toHaveValue("철수네 사진관");
  });

  it("다음을 눌러도 서버에 저장하지 않고 임시 저장 값을 지우지 않는다", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ 기본정보_상호명: "철수네 사진관" }),
    );
    setup();
    const user = userEvent.setup();

    render(
      <DraftTextStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );
    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(fetch).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")).toEqual({
      기본정보_상호명: "철수네 사진관",
    });
  });
});
