import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatVideoDate } from "@/features/video/lib/formatVideoDate";

import { VideoThumbnail } from "./VideoThumbnail";

import type { PendingOrderVideo } from "@/features/video/types";

type Props = {
  order: PendingOrderVideo;
};

export function PendingOrderCard({ order }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <VideoThumbnail templateId={order.templateId} />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold">{order.templateName}</span>
        <span className="text-muted-foreground text-xs">
          {formatVideoDate(order.updatedAt)}
        </span>
      </div>
      <Button asChild size="sm">
        <Link href={`/draft/${order.templateId}/payment?orderId=${order.id}`}>
          구매
        </Link>
      </Button>
    </div>
  );
}
