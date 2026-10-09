export type TemplateSyncStatus = "not_imported" | "imported" | "changed";

export type TemplateElement =
  | { id: string; name: string; type: "image"; source: string }
  | { id: string; name: string; type: "text"; text: string };

export type Template = {
  id: string;
  name: string;
  createdAt: string;
  status: TemplateSyncStatus;
  price: number | null;
  isActive: boolean;
  tags: string[] | null;
  updatedAt: string | null;
  elements: TemplateElement[] | null;
};
