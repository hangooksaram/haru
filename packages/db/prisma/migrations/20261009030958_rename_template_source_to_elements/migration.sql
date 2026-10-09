-- AlterTable
-- source 전체 대신 추출된 elements만 저장하도록 컬럼을 교체한다.
-- 기존 source 값은 더 이상 쓰지 않으며, 다음 "가져오기/업데이트" 실행 시 elements가 다시 채워진다.
ALTER TABLE "templates" ADD COLUMN     "elements" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "templates" ALTER COLUMN  "elements" DROP DEFAULT;
ALTER TABLE "templates" DROP COLUMN     "source";
