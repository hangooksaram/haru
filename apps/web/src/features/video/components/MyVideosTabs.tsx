"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { EditingDraftCard } from "./EditingDraftCard";
import { EmptyVideosState } from "./EmptyVideosState";
import { PendingOrderCard } from "./PendingOrderCard";
import { PurchasedOrderCard } from "./PurchasedOrderCard";

import type {
  EditingDraftVideo,
  PendingOrderVideo,
  PurchasedOrderVideo,
} from "@/features/video/types";

type Props = {
  editingDrafts: EditingDraftVideo[];
  pendingOrders: PendingOrderVideo[];
  purchasedOrders: PurchasedOrderVideo[];
};

export function MyVideosTabs({
  editingDrafts,
  pendingOrders,
  purchasedOrders,
}: Props) {
  return (
    <Tabs defaultValue="editing">
      <TabsList>
        <TabsTrigger value="editing">작성 중</TabsTrigger>
        <TabsTrigger value="pending">결제 대기</TabsTrigger>
        <TabsTrigger value="purchased">구매 완료</TabsTrigger>
      </TabsList>
      <TabsContent value="editing">
        {editingDrafts.length === 0 ? (
          <EmptyVideosState
            message="작성 중인 시안이 없어요."
            showBrowseTemplatesButton
          />
        ) : (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {editingDrafts.map((draft) => (
              <EditingDraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="pending">
        {pendingOrders.length === 0 ? (
          <EmptyVideosState message="결제 대기 중인 주문이 없어요." />
        ) : (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {pendingOrders.map((order) => (
              <PendingOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="purchased">
        {purchasedOrders.length === 0 ? (
          <EmptyVideosState message="구매한 영상이 없어요." />
        ) : (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {purchasedOrders.map((order) => (
              <PurchasedOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
