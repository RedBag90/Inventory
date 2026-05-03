import { createHmac } from 'crypto';

function secret(): string {
  const s = process.env.CRON_SECRET;
  if (!s) throw new Error('CRON_SECRET not set');
  return s;
}

export function signOptOutToken(membershipId: string): string {
  const mac = createHmac('sha256', secret()).update(`opt-out:${membershipId}`).digest('hex');
  const raw = `${membershipId}.${mac}`;
  return Buffer.from(raw).toString('base64url');
}

export function verifyOptOutToken(token: string): string | null {
  try {
    const raw          = Buffer.from(token, 'base64url').toString('utf8');
    const dotIdx       = raw.lastIndexOf('.');
    if (dotIdx === -1) return null;
    const membershipId = raw.slice(0, dotIdx);
    const mac          = raw.slice(dotIdx + 1);
    const expected     = createHmac('sha256', secret()).update(`opt-out:${membershipId}`).digest('hex');
    if (mac !== expected) return null;
    return membershipId;
  } catch {
    return null;
  }
}
