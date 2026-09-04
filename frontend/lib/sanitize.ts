import DOMPurify from "isomorphic-dompurify";

export function sanitizePostHtml(html: string) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
    FORBID_ATTR: ["srcdoc"],
  });
}
