export type EditingDraftVideo = {
  id: string;
  templateId: string;
  templateName: string;
  updatedAt: Date;
};

export type PendingOrderVideo = {
  id: string;
  templateId: string;
  templateName: string;
  updatedAt: Date;
};

export type PurchasedOrderVideo = {
  id: string;
  templateId: string;
  templateName: string;
  purchasedAt: Date;
  renderStatus: "rendering" | "completed" | "failed" | null;
  finalVideoUrl: string | null;
};
