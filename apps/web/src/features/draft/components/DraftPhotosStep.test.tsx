import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DraftPhotosStep } from "./DraftPhotosStep";

import type { Draft } from "@/features/draft/types";

const { toast } = vi.hoisted(() => ({
  toast: { error: vi.fn() },
}));
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
const { useDraftPreview } = vi.hoisted(() => ({
  useDraftPreview: vi.fn(),
}));

vi.mock("sonner", () => ({ toast }));
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
vi.mock("@/features/draft/hooks/useDraftPreview", () => ({
  useDraftPreview,
}));

function setup(draft: Draft, labels: string[]) {
  const push = vi.fn();
  const selectElement = vi.fn();
  const uploadMutate = vi.fn();
  useRouter.mockReturnValue({ push });
  useDraftId.mockReturnValue({
    draftId: "draft-1",
    setDraftId: vi.fn(),
    clearDraftId: vi.fn(),
  });
  useCreateDraft.mockReturnValue({ mutate: vi.fn() });
  useDraft.mockReturnValue({ data: draft, isLoading: false, error: null });
  useTemplatePhotoElements.mockReturnValue({ data: labels, isLoading: false });
  useUploadDraftPhotos.mockReturnValue({
    mutate: uploadMutate,
    isPending: false,
  });
  useReplaceDraftPhoto.mockReturnValue({ mutate: vi.fn() });
  useSwapDraftPhotos.mockReturnValue({ mutate: vi.fn() });
  useDraftPreview.mockReturnValue({
    containerRef: { current: null },
    isLoading: false,
    isBuffering: false,
    error: null,
    activeElementName: null,
    selectElement,
    replay: vi.fn(),
    isPlayingAll: false,
    toggleAll: vi.fn(),
    playbackProgress: 0,
  });

  return { push, selectElement, uploadMutate };
}

function createDraft(photoNames: string[]): Draft {
  return {
    id: "draft-1",
    templateId: "template-1",
    templateName: "템플릿",
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
        nextHref="/next"
      />,
    );
    await user.click(screen.getByRole("button", { name: "다음: 기본정보 입력" }));

    expect(push).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("사진을 모두 업로드해 주세요.");
  });

  it("템플릿의 사진 개수만큼 올리면 다음으로 이동한다", async () => {
    const { push } = setup(createDraft(["1", "2"]), ["1", "2"]);
    const user = userEvent.setup();

    render(
      <DraftPhotosStep
        templateId="template-1"
        nextHref="/next"
      />,
    );
    await user.click(screen.getByRole("button", { name: "다음: 기본정보 입력" }));

    expect(push).toHaveBeenCalledWith("/next");
  });

  it("사진이 채워진 요소를 클릭하면 미리보기를 해당 요소 위치로 이동시킨다", async () => {
    const { selectElement } = setup(createDraft(["1"]), ["1", "2"]);
    const user = userEvent.setup();

    render(
      <DraftPhotosStep
        templateId="template-1"
        nextHref="/next"
      />,
    );
    await user.click(screen.getByAltText("1"));

    expect(selectElement).toHaveBeenCalledWith("1");
  });

  it("사진이 비어 있는 요소를 클릭해도 미리보기를 해당 요소 위치로 이동시킨다", async () => {
    const { selectElement } = setup(createDraft(["1"]), ["1", "2"]);
    const user = userEvent.setup();

    render(
      <DraftPhotosStep
        templateId="template-1"
        nextHref="/next"
      />,
    );
    await user.click(screen.getByRole("button", { name: "사진 선택" }));

    expect(selectElement).toHaveBeenCalledWith("2");
  });

  it("한꺼번에 올리기로 선택한 파일은 특정 라벨 없이 업로드되어 빈 라벨부터 채워진다", () => {
    const { uploadMutate } = setup(createDraft(["1"]), ["1", "2"]);

    render(
      <DraftPhotosStep
        templateId="template-1"
        nextHref="/next"
      />,
    );

    const input = screen
      .getByRole("button", { name: "한꺼번에 올리기" })
      .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["x"], "a.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(uploadMutate).toHaveBeenCalledTimes(1);
    const call = uploadMutate.mock.calls[0][0];
    expect(call.label).toBeUndefined();
    expect(call.files).toEqual([file]);
  });

  it("상단에 채운 사진 수와 전체 사진 수, 남은 사진 수를 보여준다", () => {
    setup(createDraft(["1"]), ["1", "2", "3"]);

    render(
      <DraftPhotosStep
        templateId="template-1"
        nextHref="/next"
      />,
    );

    expect(screen.getByText("1장")).toBeInTheDocument();
    expect(screen.getByText("/ 전체 3장")).toBeInTheDocument();
    expect(screen.getByText("2장")).toBeInTheDocument();
  });
});
