export type DraftPhoto = {
  id: string;
  position: number;
  url: string;
};

export type DraftSavedText = {
  name: string;
  text: string;
};

export type Draft = {
  id: string;
  templateId: string;
  status: "editing" | "converting" | "converted";
  photoSlotCount: number;
  photos: DraftPhoto[];
  texts: DraftSavedText[];
};

export type DraftTextInput = {
  type: string;
  name: string;
  text: string;
};
