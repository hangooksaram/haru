import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DraftPhotoUploader } from "./DraftPhotoUploader";

function createPhotoFile(name: string) {
  return new File(["content"], name, { type: "image/jpeg" });
}

describe("DraftPhotoUploader", () => {
  it("파일 선택 입력으로 고른 파일을 onSelect로 전달한다", () => {
    const onSelect = vi.fn();
    render(<DraftPhotoUploader onSelect={onSelect} disabled={false} />);

    const input = screen.getByRole("button").querySelector("input")!;
    const files = [createPhotoFile("a.jpg"), createPhotoFile("b.jpg")];
    fireEvent.change(input, { target: { files } });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toHaveLength(2);
  });

  it("드래그앤드랍으로 여러 파일을 한번에 onSelect로 전달한다", () => {
    const onSelect = vi.fn();
    render(<DraftPhotoUploader onSelect={onSelect} disabled={false} />);

    const dropZone = screen.getByRole("button");
    const files = [createPhotoFile("a.jpg"), createPhotoFile("b.jpg")];
    fireEvent.drop(dropZone, { dataTransfer: { files } });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toHaveLength(2);
  });

  it("비활성 상태에서는 드랍해도 onSelect가 호출되지 않는다", () => {
    const onSelect = vi.fn();
    render(<DraftPhotoUploader onSelect={onSelect} disabled={true} />);

    const dropZone = screen.getByRole("button");
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [createPhotoFile("a.jpg")] },
    });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
