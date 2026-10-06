export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]!);
}
/** Stable compact numbers keep generation reproducible and keyTimes readable. */
export function number(value: number): string { return String(Number(value.toFixed(9))); }
export function attrs(values: Record<string, string | number>): string {
  return Object.entries(values).map(([key, value]) => `${key}="${escapeXml(String(value))}"`).join(' ');
}
