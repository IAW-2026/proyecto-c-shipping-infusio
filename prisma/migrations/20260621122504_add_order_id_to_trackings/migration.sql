-- AlterTable
ALTER TABLE "Tracking" ADD COLUMN     "orderId" TEXT;

-- CreateIndex
CREATE INDEX "Tracking_orderId_idx" ON "Tracking"("orderId");
