-- AlterTable
ALTER TABLE "Subscriber" ADD COLUMN     "lastEmailAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nurturingStep" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Subscriber_nurturingStep_lastEmailAt_idx" ON "Subscriber"("nurturingStep", "lastEmailAt");
