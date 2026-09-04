export const ADMIN_COOKIE = "admin_auth";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

async function hmacHex(secret: string, value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createAdminToken() {
  const password = getAdminPassword();
  if (!password) {
    return "";
  }
  return hmacHex(password, "restaurant-board-admin");
}

export async function isValidAdminToken(token?: string) {
  const expected = await createAdminToken();
  return Boolean(expected) && token === expected;
}
