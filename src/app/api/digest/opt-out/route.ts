import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { verifyOptOutToken } from '@/features/leaderboard/services/digestToken';

const HTML_OK = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Abgemeldet</title>
<style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:-apple-system,sans-serif;background:#f1f5f9}
.card{background:#fff;border-radius:16px;padding:40px;text-align:center;max-width:400px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
h1{margin:0 0 8px;font-size:22px;color:#0f172a}p{margin:0;color:#64748b;font-size:15px}</style>
</head><body><div class="card"><span style="font-size:48px">✅</span>
<h1>Erfolgreich abgemeldet</h1>
<p>Du erhältst keine wöchentlichen Leaderboard-Updates mehr für diese Olympiade.</p></div></body></html>`;

const HTML_ERR = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ungültiger Link</title>
<style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:-apple-system,sans-serif;background:#f1f5f9}
.card{background:#fff;border-radius:16px;padding:40px;text-align:center;max-width:400px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
h1{margin:0 0 8px;font-size:22px;color:#0f172a}p{margin:0;color:#64748b;font-size:15px}</style>
</head><body><div class="card"><span style="font-size:48px">❌</span>
<h1>Ungültiger Link</h1>
<p>Dieser Abmelde-Link ist ungültig oder abgelaufen.</p></div></body></html>`;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? '';

  const membershipId = verifyOptOutToken(token);
  if (!membershipId) {
    return new NextResponse(HTML_ERR, { status: 400, headers: { 'Content-Type': 'text/html' } });
  }

  await prisma.instanceMembership.update({
    where: { id: membershipId },
    data:  { digestOptOut: true },
  });

  return new NextResponse(HTML_OK, { status: 200, headers: { 'Content-Type': 'text/html' } });
}
