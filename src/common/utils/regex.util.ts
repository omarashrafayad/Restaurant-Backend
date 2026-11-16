/**
 * Escapes user input so it can be safely embedded in a RegExp / Mongo `$regex`
 * (prevents regex injection and catastrophic-backtracking payloads).
 */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Case-insensitive "contains" matcher for a user supplied search term. */
export function containsRegex(input: string) {
  return { $regex: escapeRegex(input.trim().slice(0, 100)), $options: 'i' };
}

/** Case-insensitive exact matcher for a user supplied value. */
export function exactRegex(input: string): RegExp {
  return new RegExp(`^${escapeRegex(input.trim())}$`, 'i');
}
