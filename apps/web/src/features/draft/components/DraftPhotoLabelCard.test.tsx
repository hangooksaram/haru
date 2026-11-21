import { DndContext } from "@dnd-kit/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DraftPhotoLabelCard } from "./DraftPhotoLabelCard";

describe("DraftPhotoLabelCard", () => {
  it("라벨명과 채운 슬롯 수를 보여준다", () => {
    render(
      <DndContext>
        <DraftPhotoLabelCard
          label="아기돌사진"
          slots={[
            {
              name: "아기돌사진_01",
              caption: "01",
              photo: { id: "p1", name: "아기돌사진_01", position: 0, url: "/a.jpg" },
              status: "empty",
            },
            {
              name: "아기돌사진_02",
              caption: "02",
              photo: null,
              status: "empty",
            },
            {
              name: "아기돌사진_03",
              caption: "03",
              photo: null,
              status: "empty",
            },
          ]}
          activeElementName={null}
          onUpload={vi.fn()}
          onReplace={vi.fn()}
          onSelect={vi.fn()}
          replacingPhotoId={null}
          uploadDisabled={false}
          registerNode={vi.fn()}
        />
      </DndContext>,
    );

    expect(screen.getByText("아기돌사진")).toBeInTheDocument();
    expect(screen.getByText("1/3장")).toBeInTheDocument();
    expect(screen.getByAltText("01")).toBeInTheDocument();
  });

  it("미리보기가 보여주는 요소가 이 라벨의 슬롯이면 라벨 줄에 미리보기 중, 그 슬롯에 현재 장면을 보여준다", () => {
    render(
      <DndContext>
        <DraftPhotoLabelCard
          label="아기돌사진"
          slots={[
            {
              name: "아기돌사진_01",
              caption: "01",
              photo: null,
              status: "empty",
            },
            {
              name: "아기돌사진_02",
              caption: "02",
              photo: null,
              status: "empty",
            },
          ]}
          activeElementName="아기돌사진_02"
          onUpload={vi.fn()}
          onReplace={vi.fn()}
          onSelect={vi.fn()}
          replacingPhotoId={null}
          uploadDisabled={false}
          registerNode={vi.fn()}
        />
      </DndContext>,
    );

    expect(screen.getByText("미리보기 중")).toBeInTheDocument();
    expect(screen.getByText("현재 장면")).toBeInTheDocument();
  });
});
