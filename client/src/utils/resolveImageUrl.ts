const base = import.meta.env.VITE_API_BASE_URL || '';

export function resolveImageUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${base}${path}`;
}
