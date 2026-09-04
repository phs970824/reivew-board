"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { EMAIL_PATTERN } from "@/lib/validation";
import { PasswordField } from "@/components/PasswordField";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("이메일 형식이 올바르지 않습니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(trimmedEmail, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p className="page-label">계정</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">로그인</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          가입한 이메일로 들어와 주세요.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm text-muted">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field-input"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">비밀번호</span>
            <PasswordField
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-accent">
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
        <p className="mt-4 text-sm text-subtle">
          <Link href="/forgot-password" className="font-medium text-accent hover:text-accent-hover">
            비밀번호 찾기
          </Link>
        </p>
        <p className="mt-4 text-sm text-subtle">
          아직 계정이 없나요?{" "}
          <Link href="/signup" className="font-medium text-accent hover:text-accent-hover">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
