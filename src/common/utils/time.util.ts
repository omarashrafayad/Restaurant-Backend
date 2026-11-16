/**
 * Timezone helpers. The restaurant operates in a single timezone
 * (RESTAURANT_TIMEZONE, default Africa/Cairo, which observes DST), while the
 * server/DB work in UTC. Everything "per day" or "per opening hour" must be
 * computed in the restaurant's wall-clock time.
 */

export const DEFAULT_TZ = 'Africa/Cairo';

export function restaurantTz(): string {
  return process.env.RESTAURANT_TIMEZONE || DEFAULT_TZ;
}

export interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  /** 0 = Sunday ... 6 = Saturday */
  weekday: number;
  hour: number;
  minute: number;
  /** Minutes since local midnight. */
  minuteOfDay: number;
  /** YYYY-MM-DD in local time. */
  dateStr: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function zonedParts(date: Date = new Date(), tz: string = restaurantTz()): ZonedParts {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  return {
    year,
    month,
    day,
    weekday: WEEKDAYS.indexOf(parts.weekday),
    hour,
    minute,
    minuteOfDay: hour * 60 + minute,
    dateStr: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

/** Offset (ms) between the timezone's wall clock and UTC at a given instant. */
function tzOffsetMs(date: Date, tz: string): number {
  const p = zonedParts(date, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, date.getUTCSeconds(), date.getUTCMilliseconds());
  return asUtc - date.getTime();
}

/** UTC instant of local midnight for a YYYY-MM-DD date in the timezone. */
export function startOfZonedDay(dateStr: string, tz: string = restaurantTz()): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d));
  // Two passes handle days on which the offset changes (DST).
  let instant = new Date(guess.getTime() - tzOffsetMs(guess, tz));
  instant = new Date(guess.getTime() - tzOffsetMs(instant, tz));
  return instant;
}

/** [start, end) UTC range covering a local calendar day. */
export function zonedDayRange(dateStr: string, tz: string = restaurantTz()): { start: Date; end: Date } {
  const start = startOfZonedDay(dateStr, tz);
  const [y, m, d] = dateStr.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
  return { start, end: startOfZonedDay(next, tz) };
}

/** Today's date (YYYY-MM-DD) in the restaurant timezone. */
export function todayStr(tz: string = restaurantTz()): string {
  return zonedParts(new Date(), tz).dateStr;
}

/** "HH:mm" -> minutes since midnight. */
export function hhmmToMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}

export const HHMM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
