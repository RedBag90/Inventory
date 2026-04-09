-- CreateTable: OlympiadInstance
CREATE TABLE "OlympiadInstance" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "startsAt"    TIMESTAMP(3) NOT NULL,
    "endsAt"      TIMESTAMP(3) NOT NULL,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "inviteToken" TEXT,

    CONSTRAINT "OlympiadInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable: InstanceMembership
CREATE TABLE "InstanceMembership" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "joinedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstanceMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OlympiadInstance_inviteToken_key" ON "OlympiadInstance"("inviteToken");
CREATE INDEX "OlympiadInstance_createdById_idx" ON "OlympiadInstance"("createdById");
CREATE UNIQUE INDEX "InstanceMembership_userId_key" ON "InstanceMembership"("userId");
CREATE INDEX "InstanceMembership_instanceId_idx" ON "InstanceMembership"("instanceId");

-- AddForeignKey
ALTER TABLE "OlympiadInstance" ADD CONSTRAINT "OlympiadInstance_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InstanceMembership" ADD CONSTRAINT "InstanceMembership_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InstanceMembership" ADD CONSTRAINT "InstanceMembership_instanceId_fkey"
    FOREIGN KEY ("instanceId") REFERENCES "OlympiadInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
