-- 정책: 주문 생성은 시안을 잠그지 않으므로 drafts.status의 converted 값을 없앤다.
-- 이미 converted인 시안은 결제 전까지 수정할 수 있도록 editing으로 되돌린다.
UPDATE "drafts" SET "status" = 'editing' WHERE "status" = 'converted';

ALTER TYPE "DraftStatus" RENAME TO "DraftStatus_old";
CREATE TYPE "DraftStatus" AS ENUM ('editing', 'converting');

ALTER TABLE "drafts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "drafts"
  ALTER COLUMN "status" TYPE "DraftStatus" USING ("status"::text::"DraftStatus");
ALTER TABLE "drafts" ALTER COLUMN "status" SET DEFAULT 'editing';

DROP TYPE "DraftStatus_old";
