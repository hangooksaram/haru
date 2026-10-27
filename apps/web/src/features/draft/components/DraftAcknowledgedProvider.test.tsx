import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  DraftAcknowledgedProvider,
  useDraftAcknowledged,
} from "./DraftAcknowledgedProvider";

function Probe({ draftId }: { draftId: string }) {
  const { isAcknowledged, acknowledge } = useDraftAcknowledged();

  return (
    <div>
      <p>{isAcknowledged(draftId) ? "acknowledged" : "not-acknowledged"}</p>
      <button onClick={() => acknowledge(draftId)}>acknowledge</button>
    </div>
  );
}

describe("DraftAcknowledgedProvider", () => {
  it("처음에는 draftId가 acknowledged 상태가 아니다", () => {
    render(
      <DraftAcknowledgedProvider>
        <Probe draftId="draft-1" />
      </DraftAcknowledgedProvider>,
    );

    expect(screen.getByText("not-acknowledged")).toBeInTheDocument();
  });

  it("acknowledge 후에는 isAcknowledged가 true다", async () => {
    const user = userEvent.setup();

    render(
      <DraftAcknowledgedProvider>
        <Probe draftId="draft-1" />
      </DraftAcknowledgedProvider>,
    );
    await user.click(screen.getByRole("button", { name: "acknowledge" }));

    expect(screen.getByText("acknowledged")).toBeInTheDocument();
  });

  // /templates처럼 /draft/[templateId] 바깥 경로를 거쳐 돌아오면 그 하위 트리는
  // 리마운트되지만, Provider는 루트에 남아 있어 상태가 유지되어야 한다.
  it("Provider는 유지된 채 하위 트리가 리마운트돼도 acknowledged 상태가 유지된다", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <DraftAcknowledgedProvider>
        <Probe draftId="draft-1" />
      </DraftAcknowledgedProvider>,
    );
    await user.click(screen.getByRole("button", { name: "acknowledge" }));

    rerender(
      <DraftAcknowledgedProvider>
        <div>다른 경로(/templates)</div>
      </DraftAcknowledgedProvider>,
    );
    rerender(
      <DraftAcknowledgedProvider>
        <Probe draftId="draft-1" />
      </DraftAcknowledgedProvider>,
    );

    expect(screen.getByText("acknowledged")).toBeInTheDocument();
  });
});
