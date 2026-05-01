function toMondayTime(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d.getTime();
}

export function calculateSaleStreak(saleDates: Date[]): number {
  if (saleDates.length === 0) return 0;

  const weekSet = new Set(saleDates.map(toMondayTime));

  const thisMonday = toMondayTime(new Date());
  const lastMonday = thisMonday - 7 * 86_400_000;

  let cursor = weekSet.has(thisMonday) ? thisMonday : lastMonday;
  if (!weekSet.has(cursor)) return 0;

  let streak = 0;
  while (weekSet.has(cursor)) {
    streak++;
    cursor -= 7 * 86_400_000;
  }
  return streak;
}
