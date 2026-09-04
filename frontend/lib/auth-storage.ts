const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

export type AuthUser = {
  id: number;
  email: string;
  nickname: string;
};

let cachedUserRaw: string | null = null;
let cachedUser: AuthUser | null = null;
let userCacheReady = false;

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (userCacheReady && raw === cachedUserRaw) {
    return cachedUser;
  }

  userCacheReady = true;
  cachedUserRaw = raw;
  if (!raw) {
    cachedUser = null;
    return null;
  }

  try {
    cachedUser = JSON.parse(raw) as AuthUser;
    return cachedUser;
  } catch {
    cachedUser = null;
    return null;
  }
}

export function storeAuth(token: string, user: AuthUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  cachedUserRaw = localStorage.getItem(AUTH_USER_KEY);
  cachedUser = user;
  userCacheReady = true;
  notifyAuth();
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  cachedUserRaw = null;
  cachedUser = null;
  userCacheReady = true;
  notifyAuth();
}

const authListeners = new Set<() => void>();

export function subscribeAuth(onStoreChange: () => void) {
  authListeners.add(onStoreChange);
  return () => {
    authListeners.delete(onStoreChange);
  };
}

function notifyAuth() {
  authListeners.forEach((listener) => listener());
}
