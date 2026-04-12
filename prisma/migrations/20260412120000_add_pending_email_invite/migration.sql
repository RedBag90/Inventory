-- CreateTable
CREATE TABLE IF NOT EXISTS "PendingEmailInvite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingEmailInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PendingEmailInvite_email_idx" ON "PendingEmailInvite"("email");

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PendingEmailInvite_email_instanceId_key" ON "PendingEmailInvite"("email", "instanceId");
