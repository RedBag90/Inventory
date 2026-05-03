import type { LeaderboardEntry } from '@/features/admin/services/getLeaderboard';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

function rankMedal(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}.`;
}

function rankChangeLabel(value: number): string {
  if (value > 0) return `▲ ${value}`;
  if (value < 0) return `▼ ${Math.abs(value)}`;
  return '–';
}

function rankChangeColor(value: number): string {
  if (value > 0) return '#16a34a';
  if (value < 0) return '#dc2626';
  return '#94a3b8';
}

export function buildWeeklyDigestEmail({
  entries,
  instanceName,
  recipientUserId,
  optOutUrl,
  appUrl,
}: {
  entries:         LeaderboardEntry[];
  instanceName:    string;
  recipientUserId: string;
  optOutUrl:       string;
  appUrl:          string;
}): { subject: string; html: string; text: string } {
  const subject = `🏅 Wöchentliches Update: ${instanceName}`;

  const rows = entries.map((entry, i) => {
    const rank     = i + 1;
    const isMe     = entry.id === recipientUserId;
    const label    = entry.displayName ?? entry.email.split('@')[0];
    const rowBg    = isMe ? '#eef2ff' : (rank % 2 === 0 ? '#f8fafc' : '#ffffff');
    const fontW    = isMe ? '700' : '400';
    const change   = rankChangeLabel(entry.rankChange);
    const changeColor = rankChangeColor(entry.rankChange);
    const profit   = formatCurrency(entry.totalProfit);
    const profitColor = entry.totalProfit > 0 ? '#16a34a' : entry.totalProfit < 0 ? '#dc2626' : '#64748b';

    return `
      <tr style="background:${rowBg}">
        <td style="padding:10px 12px;text-align:center;font-size:16px">${rankMedal(rank)}</td>
        <td style="padding:10px 12px;font-size:14px;font-weight:${fontW};color:#0f172a">
          ${label}${isMe ? ' <span style="background:#4f46e5;color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:999px;vertical-align:middle">Du</span>' : ''}
        </td>
        <td style="padding:10px 12px;text-align:center;font-size:13px;color:${changeColor};font-weight:500">${change}</td>
        <td style="padding:10px 12px;text-align:right;font-size:14px;font-weight:700;color:${profitColor}">${profit}</td>
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">

        <!-- Header -->
        <tr style="background:#4f46e5">
          <td style="padding:28px 32px">
            <p style="margin:0;font-size:13px;color:#c7d2fe;letter-spacing:.05em;text-transform:uppercase">Wöchentliches Update</p>
            <h1 style="margin:4px 0 0;font-size:22px;color:#ffffff">🏅 ${instanceName}</h1>
          </td>
        </tr>

        <!-- Table -->
        <tr><td style="padding:24px 24px 16px">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0">
            <thead>
              <tr style="background:#f8fafc">
                <th style="padding:10px 12px;text-align:center;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;font-weight:600">#</th>
                <th style="padding:10px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;font-weight:600">Name</th>
                <th style="padding:10px 12px;text-align:center;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;font-weight:600">Änderung</th>
                <th style="padding:10px 12px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;font-weight:600">Gewinn</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:8px 24px 24px;text-align:center">
          <a href="${appUrl}/dashboard" style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:11px 28px;border-radius:8px">
            Zur Rangliste →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr style="background:#f8fafc"><td style="padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0">
          <p style="margin:0;font-size:12px;color:#94a3b8">
            Du erhältst diese E-Mail als Teilnehmer von <strong>${instanceName}</strong>.<br>
            <a href="${optOutUrl}" style="color:#94a3b8">Abmelden</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `Wöchentliches Update: ${instanceName}`,
    '─'.repeat(40),
    ...entries.map((e, i) => {
      const rank   = i + 1;
      const label  = e.displayName ?? e.email;
      const change = rankChangeLabel(e.rankChange);
      return `${rankMedal(rank).padEnd(4)} ${label.padEnd(25)} ${change.padStart(5)}   ${formatCurrency(e.totalProfit)}`;
    }),
    '',
    `Rangliste: ${appUrl}/dashboard`,
    `Abmelden: ${optOutUrl}`,
  ].join('\n');

  return { subject, html, text };
}
