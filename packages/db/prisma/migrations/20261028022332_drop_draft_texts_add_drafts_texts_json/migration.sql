/*
  Warnings:

  - You are about to drop the `draft_texts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "draft_texts" DROP CONSTRAINT "draft_texts_draft_id_fkey";

-- AlterTable
ALTER TABLE "drafts" ADD COLUMN     "texts" JSONB NOT NULL DEFAULT '[]';

-- DropTable
DROP TABLE "draft_texts";
