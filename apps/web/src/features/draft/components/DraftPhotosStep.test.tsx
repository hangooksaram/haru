import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DraftPhotosStep } from "./DraftPhotosStep";

import type { Draft } from "@/features/draft/types";

const { useRouter } = vi.hoisted(() => ({ useRouter: vi.fn() }));
const { useDraftId } = vi.hoisted(() => ({ useDraftId: vi.fn() }));
const { useCreateDraft } = vi.hoisted(() => ({ useCreateDraft: vi.fn() }));
const { useDraft } = vi.hoisted(() => ({ useDraft: vi.fn() }));
const { useTemplatePhotoElements } = vi.hoisted(() => ({
  useTemplatePhotoElements: vi.fn(),
}));
const { useUploadDraftPhotos } = vi.hoisted(() => ({
  useUploadDraftPhotos: vi.fn(),
}));
const { useReplaceDraftPhoto } = vi.hoisted(() => ({
  useReplaceDraftPhoto: vi.fn(),
}));
const { useSwapDraftPhotos } = vi.hoisted(() => ({
  useSwapDraftPhotos: vi.fn(),
}));
const { useDraftElementPreviewPanel } = vi.hoisted(() => ({
  useDraftElementPreviewPanel: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter }));
vi.mock("@/features/draft/components/DraftIdProvider", () => ({ useDraftId }));
vi.mock("@/features/draft/hooks/useCreateDraft", () => ({ useCreateDraft }));
vi.mock("@/features/draft/hooks/useDraft", () => ({ useDraft }));
vi.mock("@/features/template/hooks/useTemplatePhotoElements", () => ({
  useTemplatePhotoElements,
}));
vi.mock("@/features/draft/hooks/useUploadDraftPhotos", () => ({
  useUploadDraftPhotos,
}));
vi.mock("@/features/draft/hooks/useReplaceDraftPhoto", () => ({
  useReplaceDraftPhoto,
}));
vi.mock("@/features/draft/hooks/useSwapDraftPhotos", () => ({
  useSwapDraftPhotos,
}));
vi.mock("@/features/draft/hooks/useDraftElementPreviewPanel", () => ({
  useDraftElementPreviewPanel,
}));

function setup(draft: Draft, labels: string[]) {
  const push = vi.fn();
  const onSelect = vi.fn();
  useRouter.mockReturnValue({ push });
  useDraftId.mockReturnValue({
    draftId: "draft-1",
    setDraftId: vi.fn(),
    clearDraftId: vi.fn(),
  });
  useCreateDraft.mockReturnValue({ mutate: vi.fn() });
  useDraft.mockReturnValue({ data: draft, isLoading: false, error: null });
  useTemplatePhotoElements.mockReturnValue({ data: labels, isLoading: false });
  useUploadDraftPhotos.mockReturnValue({ mutate: vi.fn(), isPending: false });
  useReplaceDraftPhoto.mockReturnValue({ mutate: vi.fn() });
  useSwapDraftPhotos.mockReturnValue({ mutate: vi.fn() });
  useDraftElementPreviewPanel.mockReturnValue({
    isOpen: false,
    toggle: vi.fn(),
    containerRef: { current: null },
    isLoading: false,
    isBuffering: false,
    error: null,
    onSelect,
  });

  return { push, seekToElement: onSelect };
}

function createDraft(photoNames: string[]): Draft {
  return {
    id: "draft-1",
    templateId: "template-1",
    status: "editing",
    photos: photoNames.map((name, index) => ({
      id: `photo-${index}`,
      name,
      position: index,
      url: `/photo-${index}.jpg`,
    })),
    texts: [],
  };
}

describe("DraftPhotosStep", () => {
  it("템플릿의 사진 개수만큼 올리지 않으면 다음으로 이동하지 않는다", async () => {
    const { push } = setup(createDraft(["1"]), ["1", "2"]);
    const user = userEvent.setup();

    render(
      <DraftPhotosStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );
    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(push).not.toHaveBeenCalled();
    expect(screen.getByText("사진을 모두 업로드해 주세요.")).toBeInTheDocument();
  });

  it("템플릿의 사진 개수만큼 올리면 다음으로 이동한다", async () => {
    const { push } = setup(createDraft(["1", "2"]), ["1", "2"]);
    const user = userEvent.setup();

    render(
      <DraftPhotosStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );
    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(push).toHaveBeenCalledWith("/next");
  });

  it("사진이 채워진 요소를 클릭하면 미리보기를 해당 요소 위치로 이동시킨다", async () => {
    const { seekToElement } = setup(createDraft(["1"]), ["1", "2"]);
    const user = userEvent.setup();

    render(
      <DraftPhotosStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );
    await user.click(screen.getByAltText("1"));

    expect(seekToElement).toHaveBeenCalledWith("1");
  });

  it("사진이 비어 있는 요소를 클릭해도 미리보기를 해당 요소 위치로 이동시킨다", async () => {
    const { seekToElement } = setup(createDraft(["1"]), ["1", "2"]);
    const user = userEvent.setup();

    render(
      <DraftPhotosStep
        templateId="template-1"
        prevHref="/prev"
        nextHref="/next"
      />,
    );
    await user.click(screen.getByRole("button", { name: "+ 사진 선택" }));

    expect(seekToElement).toHaveBeenCalledWith("2");
  });
});
