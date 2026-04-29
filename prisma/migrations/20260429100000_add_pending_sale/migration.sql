-- Add RESERVED value to ItemStatus enum
ALTER TYPE "ItemStatus" ADD VALUE 'RESERVED';

-- Create PendingSale table
CREATE TABLE "PendingSale" (
    "id"              TEXT NOT NULL,
    "itemId"          TEXT NOT NULL,
    "salePrice"       DECIMAL(10,2) NOT NULL,
    "salePlatform"    "Platform" NOT NULL,
    "shippingCostOut" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "soldAt"          TIMESTAMP(3) NOT NULL,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PendingSale_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PendingSale_itemId_key" ON "PendingSale"("itemId");
CREATE INDEX "PendingSale_itemId_idx" ON "PendingSale"("itemId");

ALTER TABLE "PendingSale" ADD CONSTRAINT "PendingSale_itemId_fkey"
    FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
