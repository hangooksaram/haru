export type DraftPhoto = {
  id: string;
  position: number;
  url: string;
};

export type Draft = {
  id: string;
  templateId: string;
  status: "editing" | "converting" | "converted";
  photoSlotCount: number;
  photos: DraftPhoto[];
};
