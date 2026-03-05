-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "socialPosts" JSONB;

-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "answerCapsule" TEXT,
ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "metaDescription" VARCHAR(500),
ADD COLUMN     "metaTitle" VARCHAR(255),
ADD COLUMN     "overview" TEXT,
ADD COLUMN     "priceRange" JSONB,
ADD COLUMN     "quickFacts" JSONB,
ADD COLUMN     "seasonData" JSONB;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "capturePoint" VARCHAR(50);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "leadMagnet" TEXT,
    "articleId" TEXT,
    "categorySlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleView" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE INDEX "Subscriber_email_idx" ON "Subscriber"("email");

-- CreateIndex
CREATE INDEX "ArticleView_articleId_idx" ON "ArticleView"("articleId");

-- CreateIndex
CREATE INDEX "ArticleView_createdAt_idx" ON "ArticleView"("createdAt");

-- AddForeignKey
ALTER TABLE "ArticleView" ADD CONSTRAINT "ArticleView_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
