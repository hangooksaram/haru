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

export type TemplateLang = "ko" | "en";

// GET /templates/{templateId} 응답. summary는 요청 언어로 이미 골라서 내려준다.
export type TemplateDetail = Omit<Template, "summary"> & {
  summary: string | null;
};
