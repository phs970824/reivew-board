"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { EMAIL_PATTERN } from "@/lib/validation";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedNickname = nickname.trim();

    if (!trimmedEmail || !password || !trimmedNickname) {
      setError("이메일, 비밀번호, 닉네임을 모두 입력해 주세요.");
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("이메일 형식이 올바르지 않습니다.");
      return;
    }

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (trimmedNickname.length > 50) {
      setError("닉네임은 50자 이하여야 합니다.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signup({
        email: trimmedEmail,
        password,
        nickname: trimmedNickname,
      });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p className="page-label">계정</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">회원가입</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          이메일과 닉네임으로 시작해 보세요.
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
            <span className="text-sm text-muted">닉네임</span>
            <input
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="field-input"
              autoComplete="nickname"
              maxLength={50}
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field-input"
              autoComplete="new-password"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-accent">
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>
        <p className="mt-6 text-sm text-subtle">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
