import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DraftPhotoGrid, type DraftPhotoGroup } from "./DraftPhotoGrid";

function createFile(name: string) {
  return new File(["x"], name, { type: "image/jpeg" });
}

describe("DraftPhotoGrid", () => {
  it("라벨 줄 위 어디에 놓아도 그 라벨의 빈 슬롯부터 채운다", () => {
    const onUpload = vi.fn();
    const groups: DraftPhotoGroup[] = [
      {
        label: "아기돌사진",
        slots: [
          {
            name: "아기돌사진_01",
            photo: {
              id: "p1",
              name: "아기돌사진_01",
              position: 0,
              url: "/a.jpg",
            },
            status: "empty",
          },
          { name: "아기돌사진_02", photo: null, status: "empty" },
          { name: "아기돌사진_03", photo: null, status: "empty" },
        ],
      },
    ];

    render(
      <DraftPhotoGrid
        groups={groups}
        activeElementName={null}
        onSwap={vi.fn()}
        onUpload={onUpload}
        onReplace={vi.fn()}
        onSelect={vi.fn()}
        replacingPhotoId={null}
        uploadDisabled={false}
      />,
    );

    const files = [createFile("a.jpg")];
    // 채워진 슬롯(이미지)이나 라벨 헤더 등, 빈 슬롯 바깥에 놓아도 동작해야 한다.
    fireEvent.drop(screen.getByText("아기돌사진"), { dataTransfer: { files } });

    expect(onUpload).toHaveBeenCalledWith("아기돌사진_02", files);
  });

  it("라벨의 모든 슬롯이 채워져 있으면 그 라벨에 놓아도 업로드하지 않는다", () => {
    const onUpload = vi.fn();
    const groups: DraftPhotoGroup[] = [
      {
        label: "상호명",
        slots: [
          {
            name: "상호명",
            photo: { id: "p1", name: "상호명", position: 0, url: "/a.jpg" },
            status: "empty",
          },
        ],
      },
    ];

    render(
      <DraftPhotoGrid
        groups={groups}
        activeElementName={null}
        onSwap={vi.fn()}
        onUpload={onUpload}
        onReplace={vi.fn()}
        onSelect={vi.fn()}
        replacingPhotoId={null}
        uploadDisabled={false}
      />,
    );

    fireEvent.drop(screen.getByAltText("상호명"), {
      dataTransfer: { files: [createFile("a.jpg")] },
    });

    expect(onUpload).not.toHaveBeenCalled();
  });
});
