export type TemplateSummary = {
  ko?: string;
  en?: string;
};

export type Template = {
  id: string;
  name: string;
  price: number | null;
  tags: string[];
  duration: number;
  photoCount: number;
  summary: TemplateSummary | null;
};

export type TemplateTextElementType = "기본정보" | "자막";

export type TemplateTextElement = {
  type: TemplateTextElementType;
  name: string;
  text: string;
};
