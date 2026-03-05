-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "difficulty" VARCHAR(20),
ADD COLUMN     "isEditorial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readingTime" INTEGER,
ALTER COLUMN "supplierId" DROP NOT NULL;
