-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending_payment', 'paid', 'canceled', 'rendering', 'completed', 'failed');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "draft_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending_payment',
    "price" INTEGER NOT NULL,
    "texts" JSONB NOT NULL DEFAULT '[]',
    "creatomate_render_id" TEXT,
    "render_requested_at" TIMESTAMP(3),
    "render_attempt_count" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "final_video_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_photos" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "order_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_draft_id_idx" ON "orders"("draft_id");

-- 정책(주문 생성): 시안 하나당 "대기(pending_payment)" 주문은 동시에 최대 1건만 존재한다.
-- 결제완료/취소 등 종결 상태 주문은 같은 시안에 여러 건 남을 수 있어(재구매, 취소 후 재생성)
-- draft_id에 일반 UNIQUE 제약을 걸 수 없다. pending_payment 상태에만 걸리는 부분
-- 유니크 인덱스로 "대기 주문 중복 생성"만 막는다.
CREATE UNIQUE INDEX "orders_draft_id_pending_payment_key" ON "orders"("draft_id") WHERE "status" = 'pending_payment';

-- CreateIndex
CREATE UNIQUE INDEX "order_photos_order_id_name_key" ON "order_photos"("order_id", "name");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "drafts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_photos" ADD CONSTRAINT "order_photos_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
