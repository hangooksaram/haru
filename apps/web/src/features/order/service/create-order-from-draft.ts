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

type DraftPhotoInput = { storagePath: string; position: number; name: string };
type OrderPhotoCopyPaths = DraftPhotoInput & { sourcePath: string };

// 복사 전에 목적지 경로를 미리 계산한다. order_photos 행을 실제 복사보다 먼저
// 만들어야 하므로(아래 createOrderFromDraft 참고), 경로 계산과 복사를 분리한다.
function computeOrderPhotoCopyPaths(
  orderId: string,
  photos: DraftPhotoInput[],
): OrderPhotoCopyPaths[] {
  return photos.map((photo) => {
    const extension = photo.storagePath.split(".").pop();
    const storagePath = `${orderId}/${randomUUID()}${extension ? `.${extension}` : ""}`;

    return {
      storagePath,
      position: photo.position,
      name: photo.name,
      sourcePath: photo.storagePath,
    };
  });
}

async function copyOrderPhotosToStorage(
  supabase: SupabaseClient,
  photos: OrderPhotoCopyPaths[],
): Promise<void> {
  await Promise.all(
    photos.map((photo) =>
      copyDraftPhotoToOrderPhoto(supabase, photo.sourcePath, photo.storagePath),
    ),
  );
}

// draft를 "converting"으로 잠근다. 잠그기 성공하면 true, 이미 누가 선점했으면 false.
async function lockDraft(
  draftId: string,
  currentStatus: "editing" | "converted",
): Promise<boolean> {
  const result = await prisma.draft.updateMany({
    where: { id: draftId, status: currentStatus },
    data: { status: "converting" },
  });
  return result.count > 0;
}

// 복사/주문 생성이 실패했을 때, draft 상태를 잠그기 전 상태로 되돌려 락을 푼다.
async function unlockDraftAfterFailure(
  draftId: string,
  statusBeforeLock: "editing" | "converted",
): Promise<void> {
  await prisma.draft.updateMany({
    where: { id: draftId, status: "converting" },
    data: { status: statusBeforeLock },
  });
}

// 주문 행 생성까지는 끝났지만 실제 파일 복사가 실패했을 때, 만든 주문 행을 지우고
// draft를 "converted"에서 잠그기 전 상태로 되돌린다.
async function rollbackOrderAfterCopyFailure(
  orderId: string,
  draftId: string,
  statusBeforeLock: "editing" | "converted",
): Promise<void> {
  await prisma.$transaction([
    prisma.order.delete({ where: { id: orderId } }),
    prisma.draft.update({
      where: { id: draftId },
      data: { status: statusBeforeLock },
    }),
  ]);
}

async function createOrderAndConvertDraft(params: {
  orderId: string;
  draftId: string;
  userId: string | null;
  templateId: string;
  price: number;
  texts: Prisma.InputJsonValue;
  photos: DraftPhotoInput[];
}): Promise<void> {
  await prisma.$transaction([
    prisma.order.create({
      data: {
        id: params.orderId,
        userId: params.userId,
        draftId: params.draftId,
        templateId: params.templateId,
        orderNumber: generateOrderNumber(),
        price: params.price,
        texts: params.texts,
        photos: { create: params.photos },
      },
    }),
    prisma.draft.update({
      where: { id: params.draftId },
      data: { status: "converted" },
    }),
  ]);
}

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

  const isLocked = await lockDraft(draftId, draft.status);
  if (!isLocked) {
    throw new OrderCreationConflictError(draftId);
  }

  const orderId = randomUUID();
  const photoCopyPaths = computeOrderPhotoCopyPaths(orderId, draft.photos);

  try {
    if (action === "cancel_and_create" && existingOrder) {
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: { status: "canceled" },
      });
    }

    await createOrderAndConvertDraft({
      orderId,
      draftId: draft.id,
      userId: draft.userId,
      templateId: draft.templateId,
      price: templatePrice,
      // drafts.texts는 스키마상 NOT NULL(default "[]")이라 null일 수 없다.
      texts: draft.texts as Prisma.InputJsonValue,
      photos: photoCopyPaths.map(({ storagePath, position, name }) => ({
        storagePath,
        position,
        name,
      })),
    });
  } catch (error) {
    await unlockDraftAfterFailure(draftId, draft.status);
    throw error;
  }

  try {
    // order_photos 복사를 허용하는 스토리지 RLS 정책은 orders 행의 존재를 기준으로
    // 소유권을 확인하므로, 주문 행을 먼저 만든 뒤에 실제 파일을 복사해야 한다.
    await copyOrderPhotosToStorage(supabase, photoCopyPaths);
  } catch (error) {
    await rollbackOrderAfterCopyFailure(orderId, draftId, draft.status);
    throw error;
  }

  return { id: orderId };
}
