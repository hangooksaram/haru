-- AlterTable
-- 기존 행은 duration 값이 없으므로 임시 기본값을 넣고, 다음 "가져오기/업데이트" 실행 시 실제 값으로 채워진다.
ALTER TABLE "templates" ADD COLUMN     "duration" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "templates" ALTER COLUMN  "duration" DROP DEFAULT;
