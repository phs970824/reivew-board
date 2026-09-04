export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CODE_SECONDS = 5 * 60;

export function htmlToPlainText(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function formatRemain(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
