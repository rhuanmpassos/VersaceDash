-- AlterTable
ALTER TABLE "ReferralHit" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "device_type" TEXT,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "screen_height" INTEGER,
ADD COLUMN     "screen_width" INTEGER,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "utm_campaign" TEXT,
ADD COLUMN     "utm_medium" TEXT,
ADD COLUMN     "utm_source" TEXT;

-- CreateIndex
CREATE INDEX "ReferralHit_created_at_idx" ON "ReferralHit"("created_at");

-- CreateIndex
CREATE INDEX "ReferralHit_device_type_idx" ON "ReferralHit"("device_type");

-- CreateIndex
CREATE INDEX "ReferralHit_country_idx" ON "ReferralHit"("country");

