"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatVideoDate } from "@/features/video/lib/formatVideoDate";

import { VideoThumbnail } from "./VideoThumbnail";

import type { PurchasedOrderVideo } from "@/features/video/types";

function getRenderStatusLabel(
  renderStatus: PurchasedOrderVideo["renderStatus"],
): string {
  if (renderStatus === "failed") return "영상 제작 실패";
  return "영상 제작 중";
}

type Props = {
  order: PurchasedOrderVideo;
};

export function PurchasedOrderCard({ order }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const finalVideoUrl =
    order.renderStatus === "completed" ? order.finalVideoUrl : null;

  return (
    <div className="flex flex-col gap-2.5">
      {finalVideoUrl && isPlaying ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={finalVideoUrl}
          controls
          autoPlay
          className="aspect-3/4 rounded-2xl"
        />
      ) : (
        <button
          type="button"
          disabled={!finalVideoUrl}
          onClick={() => setIsPlaying(true)}
          className="text-left disabled:cursor-not-allowed"
        >
          <VideoThumbnail templateId={order.templateId}>
            {!finalVideoUrl && (
              <span className="bg-background/85 text-foreground m-3.5 rounded-full px-2.5 py-1 text-xs font-medium">
                {getRenderStatusLabel(order.renderStatus)}
              </span>
            )}
          </VideoThumbnail>
        </button>
      )}
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold">{order.templateName}</span>
        <span className="text-muted-foreground text-xs">
          {formatVideoDate(order.purchasedAt)}
        </span>
      </div>
      {finalVideoUrl && (
        <Button asChild variant="outline" size="sm">
          <a href={finalVideoUrl} download>
            다운로드
          </a>
        </Button>
      )}
    </div>
  );
}
