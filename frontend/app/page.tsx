import { HealthStatus } from "@/components/HealthStatus";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium text-orange-600">1단계 세팅</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          지역별 맛집 후기 공유 게시판
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Next.js · Express · MySQL 기본 구조와 Docker 연동이 준비되었습니다.
        </p>
        <HealthStatus />
      </div>
    </main>
  );
}
