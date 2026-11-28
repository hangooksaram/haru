import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TemplateSwitcher } from "@/features/draft/components/TemplateSwitcher";

import type { TemplateDetail } from "@/features/template/types";

const { push, acknowledge, useTemplates, useCurrentUserId } = vi.hoisted(
  () => ({
    push: vi.fn(),
    acknowledge: vi.fn(),
    useTemplates: vi.fn(),
    useCurrentUserId: vi.fn(),
  }),
);

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/features/template/hooks/useTemplates", () => ({ useTemplates }));
vi.mock("@/features/auth/hooks/useCurrentUserId", () => ({
  useCurrentUserId,
}));
vi.mock("@/features/draft/components/DraftAcknowledgedProvider", () => ({
  useDraftAcknowledged: () => ({ acknowledge }),
}));

function createTemplate(overrides: Partial<TemplateDetail>): TemplateDetail {
  return {
    id: "template-a",
    name: "템플릿 A",
    price: 10000,
    tags: ["생일"],
    duration: 30,
    photoCount: 5,
    summary: null,
    ...overrides,
  };
}

const TEMPLATES = [
  createTemplate({ id: "template-a", name: "템플릿 A" }),
  createTemplate({ id: "template-b", name: "템플릿 B", tags: ["결혼"] }),
  createTemplate({ id: "template-c", name: "템플릿 C", tags: ["생일"] }),
];

function renderSwitcher() {
  return render(
    <TemplateSwitcher templateId="template-a" templateName="템플릿 A" />,
  );
}

async function openList() {
  const user = userEvent.setup();
  renderSwitcher();
  await user.click(screen.getByRole("button", { name: "템플릿 A" }));

  return { user, list: screen.getByRole("dialog", { name: "템플릿 변경" }) };
}

async function pickTemplateB() {
  const { user, list } = await openList();
  await user.click(within(list).getByText("템플릿 B"));

  return { user };
}

describe("TemplateSwitcher", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    push.mockReset();
    acknowledge.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    useTemplates.mockReturnValue({ data: TEMPLATES });
    useCurrentUserId.mockReturnValue("user-1");
    vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(
      () => {},
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("스텝 바의 템플릿 이름을 누르면 템플릿 목록이 열린다", async () => {
    const { list } = await openList();

    expect(list).toBeInTheDocument();
  });

  it("템플릿 이름과 ▾ 아이콘은 하나의 버튼이다", () => {
    renderSwitcher();

    const trigger = screen.getByRole("button", { name: "템플릿 A" });
    expect(trigger).toContainElement(trigger.querySelector("svg"));
  });

  it("템플릿 목록은 카테고리 탭으로 카드를 나눠 보여준다", async () => {
    const { user, list } = await openList();

    expect(
      within(list)
        .getAllByRole("tab")
        .map((tab) => tab.textContent),
    ).toEqual(["전체", "생일", "결혼"]);

    await user.click(within(list).getByRole("tab", { name: "결혼" }));

    expect(within(list).getByText("템플릿 B")).toBeInTheDocument();
    expect(within(list).queryByText("템플릿 C")).not.toBeInTheDocument();
  });

  it("템플릿에 마우스를 올리면 미리보기 영상을 재생한다", async () => {
    const { user, list } = await openList();

    await user.hover(within(list).getByText("템플릿 B"));

    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it("템플릿 목록은 현재 템플릿을 표시한다", async () => {
    const { list } = await openList();

    const currentCard = within(list).getByText("현재 템플릿").closest("button");
    expect(currentCard).toHaveAttribute("aria-current", "true");
    expect(currentCard).toHaveTextContent("템플릿 A");
  });

  it("현재 템플릿을 고르면 목록만 닫는다", async () => {
    const { user, list } = await openList();

    await user.click(within(list).getByText("템플릿 A"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("다른 템플릿을 고르면 목록을 닫고 확인 모달을 띄운다", async () => {
    localStorage.setItem("haru:draft:template-b:user-1", "draft-b1");
    await pickTemplateB();

    expect(
      screen.queryByRole("dialog", { name: "템플릿 변경" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "'템플릿 B'(으)로 바꿀까요?" }),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("확인 모달은 지금까지 입력한 내용이 저장된다는 것만 안내한다", async () => {
    await pickTemplateB();

    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
      "지금까지 입력한 내용은 저장되니 걱정하지 마세요.",
    );
  });

  it("바꾸기를 눌렀을 때 그 템플릿의 시안이 없으면 기본정보 단계로 이동해 새 시안을 만든다", async () => {
    const { user } = await pickTemplateB();

    await user.click(screen.getByRole("button", { name: "바꾸기" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/draft/template-b/basic-info");
  });

  it("바꾸기를 눌렀을 때 그 템플릿의 시안이 있으면 그 시안의 last_step(필수 항목이 빈 단계가 있으면 그 첫 단계)으로 다시 연다", async () => {
    localStorage.setItem("haru:draft:template-b:user-1", "draft-b1");
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: "draft-b1", resumeStep: "subtitle" })),
    );
    const { user } = await pickTemplateB();

    await user.click(screen.getByRole("button", { name: "바꾸기" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/drafts/draft-b1");
    expect(push).toHaveBeenCalledWith("/draft/template-b/subtitle");
  });

  it("바꾸기로 기존 시안을 다시 열면 이어하기 모달을 띄우지 않는다", async () => {
    localStorage.setItem("haru:draft:template-b:user-1", "draft-b1");
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: "draft-b1", resumeStep: "photos" })),
    );
    const { user } = await pickTemplateB();

    await user.click(screen.getByRole("button", { name: "바꾸기" }));

    expect(acknowledge).toHaveBeenCalledWith("draft-b1");
  });

  it("확인 모달에서 취소를 누르면 아무것도 바뀌지 않는다", async () => {
    const { user } = await pickTemplateB();

    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
