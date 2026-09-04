"use client";

import dynamic from "next/dynamic";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const PostEditor = dynamic(
  () => import("@/components/PostEditor").then((mod) => mod.PostEditor),
  { ssr: false, loading: () => <p className="text-sm text-muted">에디터 불러오는 중...</p> },
);

type Region = {
  id: number;
  name: string;
};

export default function WritePage() {
  const router = useRouter();
  const { user, token, ready } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionId, setRegionId] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login");
    }
  }, [ready, user, router]);

  useEffect(() => {
    async function loadRegions() {
      const response = await fetch(`${API_URL}/api/regions`);
      const data = (await response.json()) as { regions?: Region[] };
      setRegions(data.regions ?? []);
    }
    loadRegions();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const plain = content.replace(/<[^>]*>/g, "").trim();

    if (!regionId || !restaurantName.trim() || !title.trim() || !plain) {
      setError("지역, 맛집 이름, 제목, 본문을 모두 입력해 주세요.");
      return;
    }

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          region_id: Number(regionId),
          restaurant_name: restaurantName.trim(),
          title: title.trim(),
          content,
        }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "게시글 등록에 실패했습니다.");
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready || !user) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-5 pb-20 pt-6">
      <p className="page-label">후기 작성</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">맛집 기록하기</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        다녀온 식당과 솔직한 느낌을 남겨 주세요.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm text-muted">지역</span>
          <select
            value={regionId}
            onChange={(event) => setRegionId(event.target.value)}
            className="field-input"
          >
            <option value="">지역을 선택해 주세요</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-muted">맛집 이름</span>
          <input
            type="text"
            value={restaurantName}
            onChange={(event) => setRestaurantName(event.target.value)}
            className="field-input"
            maxLength={100}
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">제목</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="field-input"
            maxLength={255}
          />
        </label>
        <div>
          <span className="text-sm text-muted">본문</span>
          <div className="mt-2">
            <PostEditor value={content} onChange={setContent} />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-accent">
          {loading ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </main>
  );
}
