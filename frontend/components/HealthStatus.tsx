"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

type HealthResponse = {
  status: string;
  database: string;
  serverTime: string | null;
  error: string | null;
};

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
    <section className="mt-10 space-y-3 text-sm">
      {loading && <p className="text-muted">확인 중...</p>}
      {error && <p className="text-red-600">Backend 연결 실패: {error}</p>}
      {data && (
        <ul className="space-y-2 text-muted">
          <li>
            API{" "}
            <span className={data.status === "ok" ? "text-accent" : "text-red-600"}>
              {data.status === "ok" ? "정상" : "점검 필요"}
            </span>
          </li>
          <li>
            PostgreSQL{" "}
            <span
              className={
                data.database === "connected" ? "text-accent" : "text-red-600"
              }
            >
              {data.database === "connected" ? "연결됨" : "연결 안 됨"}
            </span>
          </li>
          {data.serverTime && <li>DB 시간 {data.serverTime}</li>}
          {data.error && <li className="text-red-600">{data.error}</li>}
        </ul>
      )}
      <p className="text-xs text-subtle">API {API_URL}/health</p>
    </section>
  );
}
