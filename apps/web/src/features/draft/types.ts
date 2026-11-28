export type DraftPhoto = {
  id: string;
  name: string;
  position: number;
  url: string;
};

export type DraftSavedText = {
  name: string;
  text: string;
};

// DB drafts.last_step 값. 유저가 가장 멀리 진행한 시안 단계.
export type DraftStep = "basic_info" | "photos" | "subtitle" | "payment";

export type Draft = {
  id: string;
  templateId: string;
  templateName: string;
  status: "editing" | "converting";
  photos: DraftPhoto[];
  texts: DraftSavedText[];
  lastStep: DraftStep;
  // 이어서 작성할 때 이동할 단계. last_step 이전에 필수 항목이 빈 단계가 있으면 그 첫 단계다.
  resumeStep: DraftStep;
};

export type DraftTextInput = {
  type: string;
  name: string;
  text: string;
};
