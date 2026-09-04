import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { HealthStatus } from "@/components/HealthStatus";

export default function AdminHealthPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-orange-600">관리자</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              연동 상태
            </h1>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              API와 MySQL 연결을 확인합니다.
            </p>
          </div>
          <AdminLogoutButton />
        </div>
        <HealthStatus />
      </div>
    </main>
  );
}
