import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DraftEditorShell } from "@/features/draft/components/DraftEditorShell";

const { useSelectedLayoutSegment, useDraftPreviewContext } = vi.hoisted(() => ({
  useSelectedLayoutSegment: vi.fn(),
  useDraftPreviewContext: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useSelectedLayoutSegment }));
vi.mock("@/features/draft/components/DraftPreviewProvider", () => ({
  useDraftPreviewContext,
}));

// 패널 안쪽에도 aria-hidden이 있어서, 미리보기 열 래퍼를 클래스로 찾는다.
function getPreviewColumn() {
  return screen
    .getByText("내 영상")
    .closest<HTMLElement>('[class*="md:col-start-2"]');
}

function renderShell() {
  return (
    <DraftEditorShell>
      <div>step</div>
    </DraftEditorShell>
  );
}

describe("DraftEditorShell", () => {
  beforeEach(() => {
    useDraftPreviewContext.mockReturnValue({
      containerRef: vi.fn(),
      isLoading: false,
      isBuffering: false,
      error: null,
      activeElementName: null,
      segments: [],
      replay: vi.fn(),
      isPlayingAll: false,
      toggleAll: vi.fn(),
      playbackProgress: 0,
      isCollapsed: false,
      setIsCollapsed: vi.fn(),
    });
  });

  it("기본정보 스텝에서는 미리보기를 화면에 보이지 않게 두되 DOM에는 유지한다", () => {
    useSelectedLayoutSegment.mockReturnValue("basic-info");

    render(renderShell());

    const hiddenWrapper = getPreviewColumn();
    expect(hiddenWrapper).toHaveAttribute("aria-hidden", "true");
    expect(hiddenWrapper).toHaveClass("md:invisible");
  });

  it("사진·자막 스텝에서는 미리보기를 보여준다", () => {
    useSelectedLayoutSegment.mockReturnValue("photos");

    render(renderShell());

    const wrapper = getPreviewColumn();
    expect(wrapper).toHaveAttribute("aria-hidden", "false");
    expect(wrapper).not.toHaveClass("md:invisible");
  });

  it("접은 미리보기 상태를 기본정보 스텝을 거쳐도 유지한다", async () => {
    useSelectedLayoutSegment.mockReturnValue("photos");
    const user = userEvent.setup();
    const { rerender } = render(renderShell());

    await user.click(screen.getByRole("button", { name: "숨기기" }));
    expect(
      await screen.findByRole("button", { name: "미리보기 다시 열기" }),
    ).toBeInTheDocument();

    // 기본정보 스텝에서는 접은 상태여도 플로팅 버튼을 보이지 않는다.
    useSelectedLayoutSegment.mockReturnValue("basic-info");
    rerender(renderShell());
    expect(
      screen.queryByRole("button", { name: "미리보기 다시 열기" }),
    ).not.toBeInTheDocument();

    // 다시 사진 스텝으로 오면 접은 상태 그대로다.
    useSelectedLayoutSegment.mockReturnValue("photos");
    rerender(renderShell());
    expect(
      screen.getByRole("button", { name: "미리보기 다시 열기" }),
    ).toBeInTheDocument();
  });
});
