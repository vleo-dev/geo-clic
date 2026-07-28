-- AlterTable
ALTER TABLE "GameHistory" ADD COLUMN     "ipAddress" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "GameHistory_ipAddress_playedAt_idx" ON "GameHistory"("ipAddress", "playedAt");
