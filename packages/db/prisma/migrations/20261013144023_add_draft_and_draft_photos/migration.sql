-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('editing', 'converting', 'converted');

-- CreateTable
CREATE TABLE "drafts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "template_id" TEXT NOT NULL,
    "status" "DraftStatus" NOT NULL DEFAULT 'editing',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draft_photos" (
    "id" TEXT NOT NULL,
    "draft_id" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "draft_photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_photos" ADD CONSTRAINT "draft_photos_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
