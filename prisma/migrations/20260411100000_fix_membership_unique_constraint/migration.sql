-- Ensure the old single-userId unique constraint is gone
-- and the correct composite (userId, instanceId) constraint exists.
-- Idempotent: uses IF EXISTS / IF NOT EXISTS guards.

ALTER TABLE "InstanceMembership" DROP CONSTRAINT IF EXISTS "InstanceMembership_userId_key";
DROP INDEX IF EXISTS "InstanceMembership_userId_key";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'InstanceMembership_userId_instanceId_key'
  ) THEN
    ALTER TABLE "InstanceMembership"
      ADD CONSTRAINT "InstanceMembership_userId_instanceId_key"
      UNIQUE ("userId", "instanceId");
  END IF;
END$$;
