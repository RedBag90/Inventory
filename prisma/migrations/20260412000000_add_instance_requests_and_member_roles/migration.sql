-- Add MemberRole enum
DO $$ BEGIN
  CREATE TYPE "MemberRole" AS ENUM ('MEMBER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add InstanceRequestStatus enum
DO $$ BEGIN
  CREATE TYPE "InstanceRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add memberRole to InstanceMembership (default MEMBER for all existing rows)
ALTER TABLE "InstanceMembership"
  ADD COLUMN IF NOT EXISTS "memberRole" "MemberRole" NOT NULL DEFAULT 'MEMBER';

-- Promote existing Olympiad creators to ADMIN within their instance
UPDATE "InstanceMembership" im
SET "memberRole" = 'ADMIN'
FROM "OlympiadInstance" oi
WHERE im."instanceId" = oi.id
  AND im."userId"     = oi."createdById";

-- Create InstanceRequest table
CREATE TABLE IF NOT EXISTS "InstanceRequest" (
  "id"           TEXT         NOT NULL,
  "userId"       TEXT         NOT NULL,
  "instanceName" TEXT         NOT NULL,
  "description"  TEXT,
  "status"       "InstanceRequestStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt"   TIMESTAMP(3),
  "resolvedById" TEXT,
  CONSTRAINT "InstanceRequest_pkey" PRIMARY KEY ("id")
);

-- Foreign keys for InstanceRequest
ALTER TABLE "InstanceRequest"
  ADD CONSTRAINT "InstanceRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InstanceRequest"
  ADD CONSTRAINT "InstanceRequest_resolvedById_fkey"
    FOREIGN KEY ("resolvedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "InstanceRequest_status_idx"  ON "InstanceRequest"("status");
CREATE INDEX IF NOT EXISTS "InstanceRequest_userId_idx"  ON "InstanceRequest"("userId");
