'use server';

import { prisma } from '@/shared/lib/prisma';
import { createClient } from '@/shared/lib/supabase/server';

export type OlympiadRecord = {
  id:           string;
  name:         string;
  description:  string | null;
  startsAt:     Date;
  endsAt:       Date;
  isActive:     boolean;
  createdAt:    Date;
  createdById:  string;
  inviteToken:  string | null;
  memberCount:  number;
};

export type OlympiadMember = {
  id:          string;
  email:       string;
  displayName: string | null;
  joinedAt:    Date;
};

export async function getOlympiads(): Promise<OlympiadRecord[]> {
  const instances = await prisma.olympiadInstance.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { memberships: true } } },
  });
  return instances.map((i) => ({
    id:          i.id,
    name:        i.name,
    description: i.description,
    startsAt:    i.startsAt,
    endsAt:      i.endsAt,
    isActive:    i.isActive,
    createdAt:   i.createdAt,
    createdById: i.createdById,
    inviteToken: i.inviteToken,
    memberCount: i._count.memberships,
  }));
}

export async function getOlympiadMembers(instanceId: string): Promise<OlympiadMember[]> {
  const memberships = await prisma.instanceMembership.findMany({
    where:   { instanceId },
    include: { user: { select: { id: true, email: true, displayName: true } } },
    orderBy: { joinedAt: 'asc' },
  });
  return memberships.map((m) => ({
    id:          m.user.id,
    email:       m.user.email,
    displayName: m.user.displayName,
    joinedAt:    m.joinedAt,
  }));
}

export async function getCurrentUserInstanceId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where:  { supabaseId: user.id },
    select: { memberships: { select: { instanceId: true }, take: 1 } },
  });
  return dbUser?.memberships[0]?.instanceId ?? null;
}
