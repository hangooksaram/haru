import { randomUUID } from "crypto";

import { Prisma, prisma } from "@haru/db";

import { DraftNotFoundError } from "@/features/draft/errors";
import { assertDraftOwner } from "@/features/draft/lib/assertDraftOwner";
import { VideoRequestInvalidError } from "@/features/video/errors";
import { isVideoRequestValid } from "@/features/video/lib/isVideoRequestValid";
import { validateVideoRequest } from "@/features/video/service/validate-video-request";

import { decideOrderCreationAction } from "../lib/decideOrderCreationAction";
import { generateOrderNumber } from "../lib/generateOrderNumber";
import {
  OrderCreationConflictError,
  TemplatePriceNotSetError,
} from "../errors";
import {
  copyDraftPhotoToOrderPhoto,
  removeOrderPhotoFiles,
} from "./order-photo-storage";
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
// converting은 복사 중에만 유지하며(수정 차단·클린업 삭제 방지), 끝나면 editing으로 되돌린다.
async function lockDraft(draftId: string): Promise<boolean> {
  const result = await prisma.draft.updateMany({
    where: { id: draftId, status: "editing" },
    data: { status: "converting" },
  });
  return result.count > 0;
}

async function unlockDraft(draftId: string): Promise<void> {
  await prisma.draft.updateMany({
    where: { id: draftId, status: "converting" },
    data: { status: "editing" },
  });
}

type OrderSource = {
  draftId: string;
  userId: string | null;
  templateId: string;
  price: number;
  texts: Prisma.InputJsonValue;
  photos: DraftPhotoInput[];
};

async function createNewOrder(
  supabase: SupabaseClient,
  source: OrderSource,
): Promise<{ id: string }> {
  const orderId = randomUUID();
  const photoCopyPaths = computeOrderPhotoCopyPaths(orderId, source.photos);

  await prisma.order.create({
    data: {
      id: orderId,
      userId: source.userId,
      draftId: source.draftId,
      templateId: source.templateId,
      orderNumber: generateOrderNumber(),
      price: source.price,
      texts: source.texts,
      photos: {
        create: photoCopyPaths.map(({ storagePath, position, name }) => ({
          storagePath,
          position,
          name,
        })),
      },
    },
  });

  try {
    // order_photos 복사를 허용하는 스토리지 RLS 정책은 orders 행의 존재를 기준으로
    // 소유권을 확인하므로, 주문 행을 먼저 만든 뒤에 실제 파일을 복사해야 한다.
    await copyOrderPhotosToStorage(supabase, photoCopyPaths);
  } catch (error) {
    await prisma.order.delete({ where: { id: orderId } });
    throw error;
  }

  return { id: orderId };
}

// 기존 대기 주문의 사진·텍스트 복사본과 금액을 현재 시안 기준으로 덮어쓴다.
async function overwriteExistingOrder(
  supabase: SupabaseClient,
  existingOrder: { id: string; photos: { storagePath: string }[] },
  source: OrderSource,
): Promise<{ id: string }> {
  const photoCopyPaths = computeOrderPhotoCopyPaths(
    existingOrder.id,
    source.photos,
  );

  try {
    await copyOrderPhotosToStorage(supabase, photoCopyPaths);
  } catch (error) {
    // 새로 복사하다 만 파일만 정리하고, 기존 주문은 그대로 둔다.
    await removeOrderPhotoFiles(
      supabase,
      photoCopyPaths.map((photo) => photo.storagePath),
    ).catch(() => undefined);
    throw error;
  }

  await prisma.$transaction([
    prisma.orderPhoto.deleteMany({ where: { orderId: existingOrder.id } }),
    prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        templateId: source.templateId,
        price: source.price,
        texts: source.texts,
        photos: {
          create: photoCopyPaths.map(({ storagePath, position, name }) => ({
            storagePath,
            position,
            name,
          })),
        },
      },
    }),
  ]);

  // DB 반영이 끝난 뒤 이전 복사 파일을 지운다. 주문은 이미 최신 상태라 실패해도 중단하지 않는다.
  await removeOrderPhotoFiles(
    supabase,
    existingOrder.photos.map((photo) => photo.storagePath),
  ).catch((error) => {
    console.error("[createOrderFromDraft] 이전 주문 사진 삭제 실패", error);
  });

  return { id: existingOrder.id };
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

  const videoValidation = await validateVideoRequest(supabase, {
    templateId: draft.templateId,
    texts: draft.texts as { name: string; text: string }[],
    photos: draft.photos,
  });
  if (!isVideoRequestValid(videoValidation)) {
    throw new VideoRequestInvalidError(videoValidation.errors.join("; "));
  }

  const templatePrice = draft.template.price;
  if (templatePrice == null) {
    throw new TemplatePriceNotSetError(draft.templateId);
  }

  const isLocked = await lockDraft(draftId);
  if (!isLocked) {
    throw new OrderCreationConflictError(draftId);
  }

  try {
    const existingOrder = await prisma.order.findFirst({
      where: { draftId, status: "pending_payment" },
      include: { photos: true },
    });

    const source: OrderSource = {
      draftId: draft.id,
      userId: draft.userId,
      templateId: draft.templateId,
      price: templatePrice,
      // drafts.texts는 스키마상 NOT NULL(default "[]")이라 null일 수 없다.
      texts: draft.texts as Prisma.InputJsonValue,
      photos: draft.photos,
    };

    if (
      existingOrder &&
      decideOrderCreationAction(existingOrder.status) === "reuse"
    ) {
      return await overwriteExistingOrder(supabase, existingOrder, source);
    }

    return await createNewOrder(supabase, source);
  } finally {
    await unlockDraft(draftId);
  }
}
