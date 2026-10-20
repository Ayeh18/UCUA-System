/** API origin. Empty means same origin (the Vite dev proxy or a reverse proxy in production). */
export const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export const API_BASE_URL = `${API_ORIGIN}/api/v1`;

/** Turn a server-relative path such as `/uploads/profile_x.png` into a loadable URL. */
export function resolveAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
