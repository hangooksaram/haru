-- CreateEnum
CREATE TYPE "OrderRenderStatus" AS ENUM ('rendering', 'completed', 'failed');

-- AlterEnum
-- 부분 유니크 인덱스(orders_draft_id_pending_payment_key)가 status 컬럼을 참조하므로
-- enum 타입 교체 전에 지우고, 교체 후 새 타입으로 다시 만든다.
BEGIN;
DROP INDEX "orders_draft_id_pending_payment_key";
CREATE TYPE "OrderStatus_new" AS ENUM ('pending_payment', 'paid', 'canceled');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending_payment';
CREATE UNIQUE INDEX "orders_draft_id_pending_payment_key" ON "orders"("draft_id") WHERE status = 'pending_payment';
COMMIT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "render_status" "OrderRenderStatus";

