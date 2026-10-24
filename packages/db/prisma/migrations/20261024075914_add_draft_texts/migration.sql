-- CreateTable
CREATE TABLE "draft_texts" (
    "id" TEXT NOT NULL,
    "draft_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "draft_texts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "draft_texts_draft_id_name_key" ON "draft_texts"("draft_id", "name");

-- AddForeignKey
ALTER TABLE "draft_texts" ADD CONSTRAINT "draft_texts_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
