/** Base URL without trailing slash (BASE_URL may be configured with one). */
export function baseUrl(): string {
  return (process.env.BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
}

/**
 * Builds the public URL for a stored upload. Values that are already absolute
 * URLs are returned untouched so the function is idempotent.
 */
export function uploadUrl(folder: string, file?: string | null): string | undefined {
  if (!file) return file ?? undefined;
  if (/^https?:\/\//i.test(file)) return file;
  return `${baseUrl()}/uploads/${folder}/${file}`;
}

/** Inverse of uploadUrl: extracts the stored file name from a public URL. */
export function uploadFileName(value?: string | null): string | undefined {
  if (!value) return value ?? undefined;
  return value.split('/').pop();
}
