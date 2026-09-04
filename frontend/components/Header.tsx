"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type TransitionEvent } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
    setVisible(false);
  }

  useEffect(() => {
    function onResize() {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setOpen(false);
        setVisible(false);
      }
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const frame = window.requestAnimationFrame(() => setOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [visible]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function openMenu() {
    if (visible) {
      setOpen(true);
      return;
    }
    setVisible(true);
  }

  function closeMenu() {
    setOpen(false);
    menuBtnRef.current?.focus();
  }

  function onPanelTransitionEnd(event: TransitionEvent<HTMLElement>) {
    if (event.target !== event.currentTarget || open) {
      return;
    }
    setVisible(false);
  }

  function onLogout() {
    closeMenu();
    logout();
  }

  return (
    <header className="px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-3 md:max-w-[1100px]">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 text-[17px] font-semibold tracking-tight"
        >
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <span className="whitespace-nowrap">맛동네</span>
        </Link>
        <button
          ref={menuBtnRef}
          type="button"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={openMenu}
          className="text-sm text-muted transition-colors hover:text-foreground md:hidden"
        >
          Menu
        </button>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {!ready ? null : user ? (
            <>
              <Link
                href="/write"
                className="rounded-xl bg-accent px-3.5 py-2 font-medium text-white transition-colors hover:bg-accent-hover"
              >
                후기 작성
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

      {visible && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="메뉴 닫기"
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              open ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeMenu}
          />
          <aside
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="메뉴"
            onTransitionEnd={onPanelTransitionEnd}
            className={`absolute inset-y-0 right-0 flex w-[min(20rem,86vw)] flex-col bg-surface px-6 py-5 transition-transform duration-300 ease-out ${
              open ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">메뉴</p>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeMenu}
                className="text-sm text-muted hover:text-foreground"
              >
                닫기
              </button>
            </div>

            <nav className="mt-10 flex flex-col gap-5 text-[15px]">
              {!ready ? null : user ? (
                <>
                  <Link href="/write" onClick={closeMenu} className="hover:text-accent">
                    후기 작성
                  </Link>
                  <p className="text-sm text-muted">{user.nickname}님</p>
                  <button type="button" onClick={onLogout} className="text-left text-muted hover:text-foreground">
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMenu} className="hover:text-accent">
                    로그인
                  </Link>
                  <Link href="/signup" onClick={closeMenu} className="hover:text-accent">
                    회원가입
                  </Link>
                </>
              )}
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}
