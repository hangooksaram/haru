import { randomUUID } from "crypto";

import { Prisma, prisma } from "@haru/db";

import { DraftNotFoundError } from "@/features/draft/errors";
import { assertDraftOwner } from "@/features/draft/lib/assertDraftOwner";

import { decideOrderCreationAction } from "../lib/decideOrderCreationAction";
import { generateOrderNumber } from "../lib/generateOrderNumber";
import {
  OrderCreationConflictError,
  TemplatePriceNotSetError,
} from "../errors";

import { copyDraftPhotoToOrderPhoto } from "./order-photo-storage";

import type { SupabaseClient } from "@supabase/supabase-js";

// 정책(주문 생성):
// - 서버는 주문에 포함된 시안이 주문하는 유저의 것인지 검증한다.
// - 서버는 결제 시작 시점에 주문을 생성하고, 시안의 사진·텍스트를 주문으로 복사한다. 주문의 사진·텍스트는 불변이다.
// - 복사 시작 시 drafts.status를 즉시 converting으로 바꿔 잠근다 (클린업 삭제와의 레이스 방지).
// - 스토리지 파일은 같은 버킷 내 copy로 복사한다 (재업로드 아님, storage_path만 복사하면 안 됨).
// - orders/order_photos insert는 하나의 DB 트랜잭션으로 묶는다.
// - 전환이 끝나면 drafts.status를 converted로 표시한다.
// - 재사용/취소/신규 생성 분기는 decideOrderCreationAction을 따른다.
export async function createOrderFromDraft(
  supabase: SupabaseClient,
  draftId: string,
  currentUserId: string | null,
): Promise<{ id: string }> {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    include: {
      photos: true,
      template: { select: { price: true } },
    },
  });

  if (!draft) throw new DraftNotFoundError(draftId);
  assertDraftOwner(draftId, draft.userId, currentUserId);

  if (draft.status === "converting") {
    throw new OrderCreationConflictError(draftId);
  }

  const templatePrice = draft.template.price;
  if (templatePrice == null) {
    throw new TemplatePriceNotSetError(draft.templateId);
  }

  const existingOrder = await prisma.order.findFirst({
    where: { draftId },
    orderBy: { createdAt: "desc" },
  });

  const action = decideOrderCreationAction(
    draft.status,
    existingOrder?.status ?? null,
  );

  if (action === "reuse") {
    // existingOrder는 action이 "reuse"일 때 항상 존재한다 (decideOrderCreationAction 참고).
    return { id: existingOrder!.id };
  }

  const locked = await prisma.draft.updateMany({
    where: { id: draftId, status: draft.status },
    data: { status: "converting" },
  });
  if (locked.count === 0) {
    throw new OrderCreationConflictError(draftId);
  }

  const orderId = randomUUID();

  try {
    if (action === "cancel_and_create" && existingOrder) {
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: { status: "canceled" },
      });
    }

    const copiedPhotos = await Promise.all(
      draft.photos.map(async (photo) => {
        const extension = photo.storagePath.split(".").pop();
        const storagePath = `${orderId}/${randomUUID()}${extension ? `.${extension}` : ""}`;

        await copyDraftPhotoToOrderPhoto(
          supabase,
          photo.storagePath,
          storagePath,
        );

        return { storagePath, position: photo.position, name: photo.name };
      }),
    );

    await prisma.$transaction([
      prisma.order.create({
        data: {
          id: orderId,
          userId: draft.userId,
          draftId: draft.id,
          templateId: draft.templateId,
          orderNumber: generateOrderNumber(),
          price: templatePrice,
          // drafts.texts는 스키마상 NOT NULL(default "[]")이라 null일 수 없다.
          texts: draft.texts as Prisma.InputJsonValue,
          photos: { create: copiedPhotos },
        },
      }),
      prisma.draft.update({
        where: { id: draftId },
        data: { status: "converted" },
      }),
    ]);
  } catch (error) {
    // 잠그기 전 상태로 되돌린다 (재구매 등 converted 상태에서 시작한 경우 포함).
    await prisma.draft.updateMany({
      where: { id: draftId, status: "converting" },
      data: { status: draft.status },
    });
    throw error;
  }

  return { id: orderId };
}
