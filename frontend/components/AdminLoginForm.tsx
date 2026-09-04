"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordField } from "@/components/PasswordField";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(json.message ?? "로그인에 실패했습니다.");
        return;
      }

      router.replace(searchParams.get("next") || "/admin/health");
      router.refresh();
    } catch {
      setError("로그인 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <label className="block">
        <span className="text-sm text-muted">관리자 비밀번호</span>
        <PasswordField
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          required
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-accent">
        {loading ? "확인 중..." : "입장"}
      </button>
    </form>
  );
}
