/** True for image paths/URLs ("/images/...", "https://..."), false for emoji like "🎩". */
export function isImageUrl(value: string | null | undefined): value is string {
  return !!value && (value.startsWith("/") || value.startsWith("http"));
}
