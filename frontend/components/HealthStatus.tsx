"use client";

import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
  database: string;
  serverTime: string | null;
  error: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function HealthStatus() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function check() {
      try {
        const response = await fetch(`${API_URL}/health`, {
          signal: controller.signal,
        });
        const json = (await response.json()) as HealthResponse;
        setData(json);
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : "연결에 실패했습니다.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    check();
    return () => controller.abort();
  }, []);

  return (
    <section className="mt-8 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        연동 상태
      </h2>
      {loading && <p className="mt-2 text-sm text-zinc-500">확인 중...</p>}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          Backend 연결 실패: {error}
        </p>
      )}
      {data && (
        <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <li>API: {data.status === "ok" ? "정상" : "점검 필요"}</li>
          <li>
            MySQL: {data.database === "connected" ? "연결됨" : "연결 안 됨"}
          </li>
          {data.serverTime && <li>DB 시간: {data.serverTime}</li>}
          {data.error && <li className="text-red-600">{data.error}</li>}
        </ul>
      )}
      <p className="mt-3 text-xs text-zinc-400">API: {API_URL}/health</p>
    </section>
  );
}
