import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DraftPreviewBinding,
  DraftPreviewProvider,
  useDraftPreviewContext,
} from "./DraftPreviewProvider";

const { PreviewMock, instances } = vi.hoisted(() => {
  const instances: InstanceType<typeof PreviewMockClass>[] = [];

  class PreviewMockClass {
    onReady?: () => void;
    loadTemplate = vi.fn().mockResolvedValue(undefined);
    setModifications = vi.fn().mockResolvedValue(undefined);
    dispose = vi.fn();
    state = { duration: 2000 };

    constructor() {
      instances.push(this);
    }
  }

  return { PreviewMock: PreviewMockClass, instances };
});
const { useDraftId } = vi.hoisted(() => ({ useDraftId: vi.fn() }));
const { useDraft } = vi.hoisted(() => ({ useDraft: vi.fn() }));

vi.mock("@creatomate/preview", () => ({ Preview: PreviewMock }));
vi.mock("@/features/draft/components/DraftIdProvider", () => ({ useDraftId }));
vi.mock("@/features/draft/hooks/useDraft", () => ({ useDraft }));

function PlayerContainer() {
  const { containerRef } = useDraftPreviewContext();
  return <div ref={containerRef} />;
}

function SegmentCount() {
  const { segments } = useDraftPreviewContext();
  return <p data-testid="segment-count">{segments.length}</p>;
}

function Harness({ step }: { step: "photos" | "text" }) {
  return (
    <DraftPreviewProvider templateId="template-1">
      <PlayerContainer />
      <SegmentCount />
      {step === "photos" ? (
        <DraftPreviewBinding segments={[{ name: "1", filled: true }]} />
      ) : (
        <DraftPreviewBinding
          segments={[
            { name: "a", filled: true },
            { name: "b", filled: false },
          ]}
        />
      )}
    </DraftPreviewProvider>
  );
}

describe("DraftPreviewProvider", () => {
  beforeEach(() => {
    instances.length = 0;
    useDraftId.mockReturnValue({ draftId: "draft-1" });
    useDraft.mockReturnValue({ data: { photos: [], texts: [] } });
  });

  it("스텝을 이동해도 Preview를 새로 만들거나 해제하지 않는다", () => {
    const { rerender } = render(<Harness step="photos" />);

    expect(instances).toHaveLength(1);

    rerender(<Harness step="text" />);
    rerender(<Harness step="photos" />);

    expect(instances).toHaveLength(1);
    expect(instances[0].dispose).not.toHaveBeenCalled();
  });

  it("스텝이 바뀌면 해당 스텝의 요소 목록으로 갱신한다", () => {
    const { rerender } = render(<Harness step="photos" />);

    expect(screen.getByTestId("segment-count")).toHaveTextContent("1");

    act(() => {
      rerender(<Harness step="text" />);
    });

    expect(screen.getByTestId("segment-count")).toHaveTextContent("2");
  });
});
