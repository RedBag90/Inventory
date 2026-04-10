-- Drop old single-user unique constraint
ALTER TABLE "InstanceMembership" DROP CONSTRAINT IF EXISTS "InstanceMembership_userId_key";

-- Add composite unique constraint (user can be in each instance once)
ALTER TABLE "InstanceMembership" ADD CONSTRAINT "InstanceMembership_userId_instanceId_key" UNIQUE ("userId", "instanceId");
