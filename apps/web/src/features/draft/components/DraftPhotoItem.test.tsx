import { DndContext } from "@dnd-kit/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DraftPhotoItem } from "./DraftPhotoItem";

import type { DraftPhotoSlotStatus } from "./DraftPhotoItem";

function renderItem(status: DraftPhotoSlotStatus, caption?: string) {
  render(
    <DndContext>
      <DraftPhotoItem
        label="아기돌사진_01"
        caption={caption}
        photo={null}
        status={status}
        onReplace={vi.fn()}
        onUpload={vi.fn()}
        onSelect={vi.fn()}
        isReplacing={false}
        uploadDisabled={false}
        registerNode={vi.fn()}
      />
    </DndContext>,
  );
}

describe("DraftPhotoItem", () => {
  it("빈 상태에서는 업로드 중/실패 문구를 보여주지 않는다", () => {
    renderItem("empty");

    expect(screen.queryByText("업로드 중...")).not.toBeInTheDocument();
    expect(screen.queryByText("다시 시도")).not.toBeInTheDocument();
  });

  it("업로드 중 상태에서는 업로드 중 문구를 보여주고 선택 버튼을 막는다", () => {
    renderItem("uploading");

    expect(screen.getByText("업로드 중...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "업로드 중" })).toBeDisabled();
  });

  it("실패 상태에서는 다시 시도 문구를 보여주고 다시 선택할 수 있다", () => {
    renderItem("failed");

    expect(screen.getByText("다시 시도")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "다시 시도" }),
    ).not.toBeDisabled();
  });
});
