"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { user, ready, logout } = useAuth();

  return (
    <header className="px-6 py-5">
      <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-[17px] font-semibold tracking-tight">
          <span className="h-2 w-2 rounded-full bg-accent" />
          맛집 후기
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {!ready ? null : user ? (
            <>
              <Link href="/write" className="btn-quiet">
                작성
              </Link>
              <span className="px-2 text-muted">{user.nickname}님</span>
              <button type="button" onClick={logout} className="btn-quiet">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-quiet">
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-accent px-3.5 py-2 font-medium text-white transition-colors hover:bg-accent-hover"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
