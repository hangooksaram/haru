-- AlterTable
ALTER TABLE "draft_photos" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "draft_photos_draft_id_name_key" ON "draft_photos"("draft_id", "name");
