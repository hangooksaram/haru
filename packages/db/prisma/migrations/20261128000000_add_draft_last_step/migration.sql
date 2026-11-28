-- 정책: 시안마다 유저가 가장 멀리 진행한 단계(last_step)를 저장하고, 시안을 다시 열 때 이 단계로 이동한다.
-- 기존 시안은 기록이 없으므로 기본값(basic_info)으로 채운다.
CREATE TYPE "DraftStep" AS ENUM ('basic_info', 'photos', 'subtitle', 'payment');

ALTER TABLE "drafts" ADD COLUMN "last_step" "DraftStep" NOT NULL DEFAULT 'basic_info';
