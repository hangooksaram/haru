// Notion "개발 > DB 스키마" 문서를 기반으로 한 타입입니다.
// 외래키/타입은 설계 의도를 표현한 것이며, 실제 마이그레이션 시 조정될 수 있습니다.

export interface User {
  id: string; // Supabase auth.users.id와 동일
  email: string | null;
  phone: string | null;
  name: string | null;
  created_at: string;
}

export interface Template {
  id: string;
  plainly_project_id: string;
  plainly_template_id: string;
  name: string;
  price: number;
  photo_slot_count: number;
  text_slot_count: number;
  is_active: boolean;
}

export type DraftStatus = "editing" | "converting" | "converted";

export interface Draft {
  id: string;
  user_id: string | null;
  template_id: string;
  status: DraftStatus;
  created_at: string;
  updated_at: string;
}

export interface DraftPhoto {
  id: string;
  draft_id: string;
  storage_path: string;
  position: number;
}

export interface DraftText {
  id: string;
  draft_id: string;
  field_key: string;
  value: string;
}

export type OrderStatus =
  "pending_payment" | "paid" | "rendering" | "completed" | "failed";

export interface Order {
  id: string;
  draft_id: string;
  order_number: string;
  user_id: string | null;
  guest_name: string | null;
  guest_contact: string | null;
  template_id: string;
  status: OrderStatus;
  price: number;
  final_video_url: string | null;
  plainly_render_id: string | null;
  render_requested_at: string | null;
  render_attempt_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrderPhoto {
  id: string;
  order_id: string;
  storage_path: string;
  position: number;
}

export interface OrderText {
  id: string;
  order_id: string;
  field_key: string;
  value: string;
}

export interface PreviewRender {
  id: string;
  draft_id: string;
  plainly_render_id: string;
  requested_at: string;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Payment {
  id: string;
  order_id: string;
  pg_provider: string | null;
  pg_transaction_id: string | null;
  amount: number;
  status: PaymentStatus;
  paid_at: string | null;
}
