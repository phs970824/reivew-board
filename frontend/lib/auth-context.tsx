"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { API_URL } from "@/lib/api";
import {
  clearAuth,
  getStoredToken,
  getStoredUser,
  storeAuth,
  type AuthUser,
} from "@/lib/auth-storage";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  sendVerification: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, password: string) => Promise<void>;
  signup: (payload: {
    email: string;
    password: string;
    nickname: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function request(path: string, body: unknown) {
  try {
    return await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "서버에 연결하지 못했습니다. 백엔드가 실행 중인지 확인해 주세요.",
    );
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setToken(getStoredToken());
    setReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      ready,
      async login(email, password) {
        const response = await request("/api/auth/login", { email, password });
        const data = (await response.json()) as {
          message?: string;
          token?: string;
          user?: AuthUser;
        };

        if (!response.ok || !data.token || !data.user) {
          throw new Error(data.message ?? "로그인에 실패했습니다.");
        }

        storeAuth(data.token, data.user);
        setToken(data.token);
        setUser(data.user);
      },
      async sendVerification(email) {
        const response = await request("/api/auth/send-verification", { email });
        const data = (await response.json()) as { message?: string };

        if (!response.ok) {
          throw new Error(data.message ?? "인증번호 발송에 실패했습니다.");
        }
      },
      async verifyCode(email, code) {
        const response = await request("/api/auth/verify-code", { email, code });
        const data = (await response.json()) as { message?: string };

        if (!response.ok) {
          throw new Error(data.message ?? "인증번호 확인에 실패했습니다.");
        }
      },
      async sendPasswordReset(email) {
        const response = await request("/api/auth/send-password-reset", { email });
        const data = (await response.json()) as { message?: string };

        if (!response.ok) {
          throw new Error(data.message ?? "인증번호 발송에 실패했습니다.");
        }
      },
      async verifyResetCode(email, code) {
        const response = await request("/api/auth/verify-reset-code", { email, code });
        const data = (await response.json()) as { message?: string };

        if (!response.ok) {
          throw new Error(data.message ?? "인증번호 확인에 실패했습니다.");
        }
      },
      async resetPassword(email, password) {
        const response = await request("/api/auth/reset-password", { email, password });
        const data = (await response.json()) as { message?: string };

        if (!response.ok) {
          throw new Error(data.message ?? "비밀번호 변경에 실패했습니다.");
        }
      },
      async signup({ email, password, nickname }) {
        const response = await request("/api/auth/signup", {
          email,
          password,
          nickname,
        });
        const data = (await response.json()) as { message?: string };

        if (!response.ok) {
          throw new Error(data.message ?? "회원가입에 실패했습니다.");
        }
      },
      logout() {
        clearAuth();
        setToken(null);
        setUser(null);
      },
    }),
    [user, token, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }
  return context;
}
