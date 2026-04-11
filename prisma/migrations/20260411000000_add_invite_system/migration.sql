-- Add joinCode and autoAccept to OlympiadInstance
ALTER TABLE "OlympiadInstance" ADD COLUMN IF NOT EXISTS "joinCode" TEXT;
ALTER TABLE "OlympiadInstance" ADD COLUMN IF NOT EXISTS "autoAccept" BOOLEAN NOT NULL DEFAULT true;
CREATE UNIQUE INDEX IF NOT EXISTS "OlympiadInstance_joinCode_key" ON "OlympiadInstance"("joinCode");

-- Add JoinRequestStatus enum
DO $$ BEGIN
  CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create JoinRequest table
CREATE TABLE IF NOT EXISTS "JoinRequest" (
  "id"           TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "instanceId"   TEXT NOT NULL,
  "status"       "JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt"   TIMESTAMP(3),
  "resolvedById" TEXT,
  CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_instanceId_fkey"
  FOREIGN KEY ("instanceId") REFERENCES "OlympiadInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_resolvedById_fkey"
  FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "JoinRequest_instanceId_status_idx" ON "JoinRequest"("instanceId", "status");
CREATE INDEX IF NOT EXISTS "JoinRequest_userId_idx" ON "JoinRequest"("userId");
