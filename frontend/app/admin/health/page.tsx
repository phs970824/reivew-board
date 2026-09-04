import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { HealthStatus } from "@/components/HealthStatus";

export default function AdminHealthPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="page-label">관리자</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              연동 상태
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              API와 PostgreSQL 연결을 확인합니다.
            </p>
          </div>
          <AdminLogoutButton />
        </div>
        <HealthStatus />
      </div>
    </main>
  );
}
