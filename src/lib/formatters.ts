// Shared time/date formatting utilities that accept a t() function for i18n

type TFunc = (key: string, params?: Record<string, string | number>) => string;

export function formatTimeLabel(createdAt: string, t: TFunc): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (mins < 1) return t('time.justNow');
  if (h < 1) return t('notif.ago.minutes', { count: mins });
  if (d === 0) return t('time.hoursAgo', { count: h });
  if (d === 1) return t('time.yesterday');
  if (d < 7) return t('time.daysAgo', { count: d });
  if (d < 30) return t('time.weeksAgo', { count: Math.floor(d / 7) });
  return t('time.monthsAgo', { count: Math.floor(d / 30) });
}

export function formatMemberSince(dateStr: string | undefined, t: TFunc): string {
  if (!dateStr) return t('time.unknown');
  const date = new Date(dateStr);
  return `${t('time.month.' + date.getMonth())} ${date.getFullYear()}`;
}
