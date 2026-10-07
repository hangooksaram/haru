export type TemplateSyncStatus = "not_imported" | "imported" | "changed";

export type Template = {
  id: string;
  name: string;
  createdAt: string;
  status: TemplateSyncStatus;
  price: number | null;
  isActive: boolean;
  tags: string[] | null;
  updatedAt: string | null;
  source: unknown | null;
};
