export type PulsePeriod = 'this_month' | 'last_month' | 'last_7_days' | 'last_30_days' | 'this_year';

export interface DateRange {
  from: string;
  to: string;
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function diffInDays(from: Date, to: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((startOfDay(to).getTime() - startOfDay(from).getTime()) / msPerDay) + 1;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getCurrentRange(period: PulsePeriod, now = new Date()): DateRange {
  const today = startOfDay(now);
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();

  switch (period) {
    case 'this_month':
      return {
        from: toIsoDate(new Date(Date.UTC(year, month, 1))),
        to: toIsoDate(today),
      };
    case 'last_month':
      return {
        from: toIsoDate(new Date(Date.UTC(year, month - 1, 1))),
        to: toIsoDate(new Date(Date.UTC(year, month, 0))),
      };
    case 'last_7_days':
      return {
        from: toIsoDate(addDays(today, -6)),
        to: toIsoDate(today),
      };
    case 'last_30_days':
      return {
        from: toIsoDate(addDays(today, -29)),
        to: toIsoDate(today),
      };
    case 'this_year':
      return {
        from: toIsoDate(new Date(Date.UTC(year, 0, 1))),
        to: toIsoDate(today),
      };
  }
}

export function getDateRange(period: PulsePeriod, now = new Date()) {
  return getCurrentRange(period, now);
}

export function getPreviousDateRange(period: PulsePeriod, now = new Date()): DateRange {
  const current = getCurrentRange(period, now);
  const currentFrom = new Date(`${current.from}T00:00:00.000Z`);
  const currentTo = new Date(`${current.to}T00:00:00.000Z`);
  const duration = diffInDays(currentFrom, currentTo);
  const previousTo = addDays(currentFrom, -1);
  const previousFrom = addDays(previousTo, -(duration - 1));

  return {
    from: toIsoDate(previousFrom),
    to: toIsoDate(previousTo),
  };
}
