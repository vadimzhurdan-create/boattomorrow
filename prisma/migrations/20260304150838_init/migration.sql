-- CreateEnum
CREATE TYPE "SupplierType" AS ENUM ('charter', 'manufacturer', 'school');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('pending', 'active', 'blocked');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "ArticleCategory" AS ENUM ('destination', 'route', 'boat', 'learning', 'tips', 'gear');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('draft', 'review', 'published', 'rejected');

-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('article_charter', 'article_manufacturer', 'article_school', 'profile');

-- CreateEnum
CREATE TYPE "QuizSessionStatus" AS ENUM ('in_progress', 'completed');

-- CreateEnum
CREATE TYPE "LeadSourceType" AS ENUM ('article', 'profile', 'search');

-- CreateEnum
CREATE TYPE "LeadIntent" AS ENUM ('charter_booking', 'boat_purchase', 'school_enrollment', 'general');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new_lead', 'seen', 'contacted', 'closed');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('supplier', 'superadmin');

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "type" "SupplierType" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'supplier',
    "status" "SupplierStatus" NOT NULL DEFAULT 'pending',
    "tagline" VARCHAR(255),
    "description" TEXT,
    "logoUrl" TEXT,
    "coverImageUrl" TEXT,
    "imageUrls" TEXT[],
    "website" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "regions" TEXT[],
    "typeMeta" JSONB,
    "profileStatus" "ProfileStatus" NOT NULL DEFAULT 'draft',
    "profileQuizSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "supplierType" "SupplierType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "metaTitle" VARCHAR(60),
    "metaDescription" VARCHAR(160),
    "category" "ArticleCategory" NOT NULL,
    "region" VARCHAR(100),
    "tags" TEXT[],
    "status" "ArticleStatus" NOT NULL DEFAULT 'draft',
    "coverImageUrl" TEXT,
    "imageUrls" TEXT[],
    "quizSessionId" TEXT,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "leadsCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSession" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "quizType" "QuizType" NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "messages" JSONB NOT NULL DEFAULT '[]',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "imageUrls" TEXT[],
    "status" "QuizSessionStatus" NOT NULL DEFAULT 'in_progress',
    "generatedDraft" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QuizSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "articleId" TEXT,
    "sourceType" "LeadSourceType" NOT NULL,
    "intent" "LeadIntent" NOT NULL DEFAULT 'general',
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "message" TEXT,
    "destination" VARCHAR(255),
    "dates" VARCHAR(100),
    "groupSize" INTEGER,
    "status" "LeadStatus" NOT NULL DEFAULT 'new_lead',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "allowedSupplierTypes" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_slug_key" ON "Supplier"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_email_key" ON "Supplier"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_profileQuizSessionId_key" ON "Supplier"("profileQuizSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Article_quizSessionId_key" ON "Article"("quizSessionId");

-- CreateIndex
CREATE INDEX "Article_supplierId_idx" ON "Article"("supplierId");

-- CreateIndex
CREATE INDEX "Article_category_idx" ON "Article"("category");

-- CreateIndex
CREATE INDEX "Article_status_idx" ON "Article"("status");

-- CreateIndex
CREATE INDEX "Article_slug_idx" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "QuizSession_supplierId_idx" ON "QuizSession"("supplierId");

-- CreateIndex
CREATE INDEX "Lead_supplierId_idx" ON "Lead"("supplierId");

-- CreateIndex
CREATE INDEX "Lead_articleId_idx" ON "Lead"("articleId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_profileQuizSessionId_fkey" FOREIGN KEY ("profileQuizSessionId") REFERENCES "QuizSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_quizSessionId_fkey" FOREIGN KEY ("quizSessionId") REFERENCES "QuizSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSession" ADD CONSTRAINT "QuizSession_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;
