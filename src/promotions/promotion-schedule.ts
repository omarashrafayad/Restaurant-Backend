import { hhmmToMinutes, zonedParts } from '../common/utils/time.util.js';

export interface SchedulablePromotion {
  isActive: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  daysOfWeek?: number[];
  startTime?: string | null;
  endTime?: string | null;
}

/**
 * Returns the key of the window `now` falls in, or null when the promotion is
 * not running. The key identifies one occurrence (used to notify once):
 *   "once"        - no recurring rule, one continuous period
 *   "YYYY-MM-DD"  - recurring: local date on which the window started
 */
export function activeWindowKey(p: SchedulablePromotion, now: Date = new Date()): string | null {
  if (!p.isActive) return null;
  if (p.startDate && new Date(p.startDate).getTime() > now.getTime()) return null;
  if (p.endDate && new Date(p.endDate).getTime() < now.getTime()) return null;

  const days = p.daysOfWeek ?? [];
  const local = zonedParts(now);
  const yesterday = zonedParts(new Date(now.getTime() - 24 * 3600 * 1000));

  if (p.startTime && p.endTime) {
    const start = hhmmToMinutes(p.startTime);
    const end = hhmmToMinutes(p.endTime);
    const overnight = end <= start;
    const dayAllowed = (weekday: number) => !days.length || days.includes(weekday);

    if (!overnight) {
      return local.minuteOfDay >= start && local.minuteOfDay < end && dayAllowed(local.weekday)
        ? local.dateStr
        : null;
    }
    // Overnight window e.g. 22:00 -> 02:00: tonight's part or the tail of yesterday's.
    if (local.minuteOfDay >= start && dayAllowed(local.weekday)) return local.dateStr;
    if (local.minuteOfDay < end && dayAllowed(yesterday.weekday)) return yesterday.dateStr;
    return null;
  }

  if (days.length) return days.includes(local.weekday) ? local.dateStr : null;
  return 'once';
}

export function isPromotionActive(p: SchedulablePromotion, now: Date = new Date()): boolean {
  return activeWindowKey(p, now) !== null;
}

/** Mongo pre-filter: enabled and inside the date range (day/time rules are checked in JS). */
export function dateRangeFilter(now: Date = new Date()) {
  return {
    isActive: true,
    startDate: { $lte: now },
    $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }],
  };
}
