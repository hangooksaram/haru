import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DraftStepBar } from "@/components/DraftStepBar";

vi.mock("@/features/draft/components/TemplateSwitcher", () => ({
  TemplateSwitcher: ({ templateName }: { templateName: string }) => (
    <span>{templateName}</span>
  ),
}));

describe("DraftStepBar", () => {
  it("스테퍼에서 last_step까지의 단계를 눌러 이동할 수 있다", () => {
    render(
      <DraftStepBar
        current={0}
        templateId="template-1"
        templateName="템플릿"
        lastStep="subtitle"
      />,
    );

    expect(screen.getByRole("link", { name: /사진/ })).toHaveAttribute(
      "href",
      "/draft/template-1/photos",
    );
    expect(screen.getByRole("link", { name: /자막/ })).toHaveAttribute(
      "href",
      "/draft/template-1/subtitle",
    );
    expect(
      screen.queryByRole("link", { name: /확인·결제/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /기본정보/ }),
    ).not.toBeInTheDocument();
  });
});
