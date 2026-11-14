import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EditingDraftCard } from "./EditingDraftCard";

const { useRouter } = vi.hoisted(() => ({ useRouter: vi.fn() }));
const { useCurrentUserId } = vi.hoisted(() => ({ useCurrentUserId: vi.fn() }));
const { useDraftAcknowledged } = vi.hoisted(() => ({
  useDraftAcknowledged: vi.fn(),
}));
const { readStoredDraftId, writeStoredDraftId } = vi.hoisted(() => ({
  readStoredDraftId: vi.fn(),
  writeStoredDraftId: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter }));
vi.mock("@/features/auth/hooks/useCurrentUserId", () => ({
  useCurrentUserId,
}));
vi.mock("@/features/draft/components/DraftAcknowledgedProvider", () => ({
  useDraftAcknowledged,
}));
vi.mock("@/features/draft/hooks/useStoredDraftId", () => ({
  readStoredDraftId,
  writeStoredDraftId,
}));

const draft = {
  id: "draft-1",
  templateId: "template-1",
  templateName: "프로포즈",
  updatedAt: new Date("2026-11-01"),
};

function setup({ storedDraftId }: { storedDraftId: string | null }) {
  const push = vi.fn();
  const acknowledge = vi.fn();

  useRouter.mockReturnValue({ push });
  useCurrentUserId.mockReturnValue("user-1");
  useDraftAcknowledged.mockReturnValue({ acknowledge, isAcknowledged: vi.fn() });
  readStoredDraftId.mockReturnValue(storedDraftId);

  return { push, acknowledge };
}

describe("EditingDraftCard", () => {
  it("로컬 저장소에 같은 draftId가 없으면 저장하고 이어서 작성하러 이동한다", async () => {
    const { push, acknowledge } = setup({ storedDraftId: "other-draft" });
    const user = userEvent.setup();

    render(<EditingDraftCard draft={draft} />);
    await user.click(screen.getByRole("button", { name: /프로포즈/ }));

    expect(writeStoredDraftId).toHaveBeenCalledWith(
      "template-1",
      "user-1",
      "draft-1",
    );
    expect(acknowledge).toHaveBeenCalledWith("draft-1");
    expect(push).toHaveBeenCalledWith("/draft/template-1/photos");
  });

  it("이미 같은 draftId가 저장되어 있으면 다시 저장하지 않는다", async () => {
    const { push } = setup({ storedDraftId: "draft-1" });
    const user = userEvent.setup();

    render(<EditingDraftCard draft={draft} />);
    await user.click(screen.getByRole("button", { name: /프로포즈/ }));

    expect(writeStoredDraftId).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/draft/template-1/photos");
  });
});
