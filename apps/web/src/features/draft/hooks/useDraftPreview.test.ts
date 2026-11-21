import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDraftPreview } from "./useDraftPreview";

import type { DraftPhoto, DraftSavedText } from "@/features/draft/types";

type FakeElement = {
  globalTime: number;
  duration: number;
  source: { name: string };
};

const { PreviewMock, instances } = vi.hoisted(() => {
  const instances: InstanceType<typeof PreviewMockClass>[] = [];

  class PreviewMockClass {
    onReady?: () => void;
    onLoad?: () => void;
    onLoadComplete?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onTimeChange?: (time: number) => void;
    loadTemplate = vi.fn().mockResolvedValue(undefined);
    setModifications = vi.fn().mockResolvedValue(undefined);
    setTime = vi.fn();
    play = vi.fn().mockImplementation(() => {
      this.onPlay?.();
      return Promise.resolve();
    });
    pause = vi.fn().mockImplementation(() => {
      this.onPause?.();
      return Promise.resolve();
    });
    dispose = vi.fn();
    findElement = vi.fn();
    getElements = vi.fn().mockReturnValue([]);
    state = { duration: 2000 };

    constructor() {
      instances.push(this);
    }
  }

  return { PreviewMock: PreviewMockClass, instances };
});

vi.mock("@creatomate/preview", () => ({ Preview: PreviewMock }));

const ELEMENT: FakeElement = {
  globalTime: 1000,
  duration: 500,
  source: { name: "상호명" },
};

const ELEMENT_2: FakeElement = {
  globalTime: 1500,
  duration: 500,
  source: { name: "첫 장면" },
};

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function setupReady(
  initialPhotos: DraftPhoto[] = [],
  initialTexts: DraftSavedText[] = [],
) {
  const { result, rerender } = renderHook(
    (props: { photos: DraftPhoto[]; texts: DraftSavedText[] }) =>
      useDraftPreview({ templateId: "template-1", ...props }),
    { initialProps: { photos: initialPhotos, texts: initialTexts } },
  );

  act(() => {
    result.current.containerRef(document.createElement("div"));
  });

  const preview = instances[instances.length - 1];
  preview.findElement.mockImplementation(
    (predicate: (element: FakeElement) => boolean) =>
      predicate(ELEMENT) ? ELEMENT : undefined,
  );

  await act(async () => {
    await preview.onReady?.();
  });

  return { result, rerender, preview };
}

describe("useDraftPreview", () => {
  beforeEach(() => {
    instances.length = 0;
  });

  it("요소를 선택하면 해당 요소의 타임라인 위치로 이동하고, 재생하지 않는다", async () => {
    const { result, preview } = await setupReady();

    act(() => {
      result.current.selectElement("상호명");
    });

    expect(preview.setTime).toHaveBeenCalledWith(
      ELEMENT.globalTime + 1,
    );
    expect(preview.pause).toHaveBeenCalled();
    expect(preview.play).not.toHaveBeenCalled();
  });

  it("사진·텍스트가 반영되면 해당 요소의 프레임으로 이동해 멈추고, 자동 재생하지 않는다", async () => {
    const { rerender, preview } = await setupReady([], [
      { name: "상호명", text: "기존" },
    ]);

    rerender({ photos: [], texts: [{ name: "상호명", text: "철수" }] });
    await flush();

    expect(preview.setTime).toHaveBeenCalledWith(ELEMENT.globalTime + 1);
    expect(preview.pause).toHaveBeenCalled();
    expect(preview.play).not.toHaveBeenCalled();
  });

  it("다시보기를 누르면 선택했던 요소의 구간을 다시 재생한다", async () => {
    const { result, preview } = await setupReady();

    act(() => {
      result.current.selectElement("상호명");
    });
    preview.setTime.mockClear();
    preview.play.mockClear();

    act(() => {
      result.current.replay();
    });

    expect(preview.setTime).toHaveBeenCalledWith(ELEMENT.globalTime + 1);
    expect(preview.play).toHaveBeenCalled();
  });

  it("전체 재생을 누르면 영상 전체를 재생하고, 다시 누르면 일시정지한다", async () => {
    const { result, preview } = await setupReady();

    expect(result.current.isPlayingAll).toBe(false);

    act(() => {
      result.current.toggleAll();
    });

    expect(preview.play).toHaveBeenCalled();
    expect(result.current.isPlayingAll).toBe(true);

    act(() => {
      result.current.toggleAll();
    });

    expect(preview.pause).toHaveBeenCalled();
    expect(result.current.isPlayingAll).toBe(false);
  });

  it("재생 위치가 바뀌면 전체 재생 진행률을 갱신한다", async () => {
    const { result, preview } = await setupReady();

    act(() => {
      preview.onTimeChange?.(500);
    });

    expect(result.current.playbackProgress).toBeCloseTo(500 / 2000);
  });

  it("전체 재생 중에는 재생 위치를 따라 활성 요소가 바뀐다", async () => {
    const { result, preview } = await setupReady();
    preview.getElements.mockReturnValue([ELEMENT, ELEMENT_2]);

    act(() => {
      result.current.toggleAll();
    });

    act(() => {
      preview.onTimeChange?.(ELEMENT_2.globalTime + 1);
    });

    expect(result.current.activeElementName).toBe("첫 장면");
  });
});
