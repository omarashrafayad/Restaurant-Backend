/** Egyptian mobile: 010/011/012/015 + 8 digits, optional +20 / 0020 prefix. */
export const EG_MOBILE_REGEX = /^(?:\+?20|0020)?0?1[0125]\d{8}$/;

/** Normalises to the local 11-digit form (01XXXXXXXXX). */
export function normalizeEgMobile(value: string): string {
  const digits = value.replace(/[^\d]/g, '').replace(/^0020/, '').replace(/^20/, '');
  return digits.startsWith('0') ? digits : `0${digits}`;
}
