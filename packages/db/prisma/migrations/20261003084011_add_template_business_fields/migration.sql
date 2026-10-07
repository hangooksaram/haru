-- AlterTable
ALTER TABLE "templates" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" INTEGER,
ADD COLUMN     "sort_order" INTEGER;
