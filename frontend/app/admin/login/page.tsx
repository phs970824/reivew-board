import { Suspense } from "react";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium text-orange-600">관리자</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          연동 상태 확인
        </h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          관리자만 입장할 수 있습니다.
        </p>
        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
