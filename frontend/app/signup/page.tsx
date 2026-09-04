"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { CODE_SECONDS, EMAIL_PATTERN, formatRemain } from "@/lib/validation";
import { PasswordField } from "@/components/PasswordField";

export default function SignupPage() {
  const router = useRouter();
  const { signup, sendVerification, verifyCode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [remainSeconds, setRemainSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const codeExpired = codeSent && !emailVerified && remainSeconds <= 0;

  useEffect(() => {
    if (emailVerified || remainSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainSeconds((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [emailVerified, remainSeconds]);

  async function onSendCode() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("이메일을 입력해 주세요.");
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("이메일 형식이 올바르지 않습니다.");
      return;
    }

    setSending(true);
    setError(null);
    setInfo(null);

    try {
      await sendVerification(trimmedEmail);
      setCode("");
      setEmailVerified(false);
      setCodeSent(true);
      setRemainSeconds(CODE_SECONDS);
      setInfo("인증번호를 발송했습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증번호 발송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  }

  async function onVerifyCode() {
    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setError("인증번호를 입력해 주세요.");
      return;
    }

    setVerifying(true);
    setError(null);
    setInfo(null);

    try {
      await verifyCode(trimmedEmail, trimmedCode);
      setEmailVerified(true);
      setRemainSeconds(0);
      setInfo("인증 완료");
    } catch (err) {
      const message = err instanceof Error ? err.message : "인증번호 확인에 실패했습니다.";
      setError(message);
      if (message.includes("만료")) {
        setRemainSeconds(0);
      }
    } finally {
      setVerifying(false);
    }
  }

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

    if (!emailVerified) {
      setError("이메일 인증이 필요합니다.");
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
          이메일 인증 후 닉네임과 비밀번호로 가입해 주세요.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <span className="text-sm text-muted">이메일</span>
            <div className="mt-2 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailVerified(false);
                  setCodeSent(false);
                  setCode("");
                  setRemainSeconds(0);
                  setInfo(null);
                }}
                className="field-input mt-0 flex-1"
                autoComplete="email"
                readOnly={emailVerified}
              />
              <button
                type="button"
                onClick={onSendCode}
                disabled={sending || emailVerified || (codeSent && remainSeconds > 0)}
                className="shrink-0 rounded-xl bg-accent px-3 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {sending ? "발송 중..." : codeSent && !emailVerified ? "재발송" : "인증번호 발송"}
              </button>
            </div>
            {emailVerified ? (
              <p className="mt-2 text-sm font-medium text-accent">인증 완료</p>
            ) : codeSent && remainSeconds > 0 ? (
              <p className="mt-2 text-sm text-muted">남은 시간 {formatRemain(remainSeconds)}</p>
            ) : codeExpired ? (
              <p className="mt-2 text-sm text-muted">인증번호가 만료되었습니다. 재발송해 주세요.</p>
            ) : null}
          </div>

          {codeSent && !emailVerified && (
            <div>
              <span className="text-sm text-muted">인증번호</span>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="field-input mt-0 flex-1"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="6자리 숫자"
                />
                <button
                  type="button"
                  onClick={onVerifyCode}
                  disabled={verifying || codeExpired}
                  className="shrink-0 rounded-xl bg-accent px-3 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                >
                  {verifying ? "확인 중..." : "확인"}
                </button>
              </div>
            </div>
          )}

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
            <PasswordField
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
          </label>
          {info && !error && <p className="text-sm text-accent">{info}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading || !emailVerified} className="btn-accent">
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
