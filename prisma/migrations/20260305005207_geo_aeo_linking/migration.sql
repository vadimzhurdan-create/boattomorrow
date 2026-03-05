-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "answerCapsule" TEXT,
ADD COLUMN     "cornerstoneId" TEXT,
ADD COLUMN     "destinationId" TEXT,
ADD COLUMN     "faqItems" JSONB,
ADD COLUMN     "isCornerstone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keyFacts" JSONB,
ADD COLUMN     "lastReviewedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "canonicalName" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "aliases" TEXT[],
    "region" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Destination_canonicalName_key" ON "Destination"("canonicalName");

-- CreateIndex
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");

-- CreateIndex
CREATE INDEX "Article_region_idx" ON "Article"("region");

-- CreateIndex
CREATE INDEX "Article_destinationId_idx" ON "Article"("destinationId");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_cornerstoneId_fkey" FOREIGN KEY ("cornerstoneId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
