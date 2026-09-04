import { Suspense } from "react";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <p className="page-label">관리자</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          연동 상태 확인
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          관리자만 입장할 수 있습니다.
        </p>
        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
