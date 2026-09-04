"use client";

import { useEffect, useState } from "react";
import { PopularPosts } from "@/components/PopularPosts";
import { PostCard } from "@/components/PostCard";
import { RegionPicker } from "@/components/RegionPicker";
import { API_URL } from "@/lib/api";
import type { PostSummary, Region } from "@/lib/types";

export function HomeBoard() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionId, setRegionId] = useState<number | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [popular, setPopular] = useState<PostSummary[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    async function loadRegions() {
      const response = await fetch(`${API_URL}/api/regions`);
      const data = (await response.json()) as { regions?: Region[] };
      setRegions(data.regions ?? []);
    }
    loadRegions();
  }, []);

  useEffect(() => {
    async function loadPosts() {
      setLoadingPosts(true);
      try {
        const query = regionId ? `?region_id=${regionId}` : "";
        const response = await fetch(`${API_URL}/api/posts${query}`);
        const data = (await response.json()) as { posts?: PostSummary[] };
        setPosts(data.posts ?? []);
      } finally {
        setLoadingPosts(false);
      }
    }
    loadPosts();
  }, [regionId]);

  useEffect(() => {
    async function loadPopular() {
      setLoadingPopular(true);
      try {
        const response = await fetch(`${API_URL}/api/posts/popular`);
        const data = (await response.json()) as { posts?: PostSummary[] };
        setPopular(data.posts ?? []);
      } finally {
        setLoadingPopular(false);
      }
    }
    loadPopular();
  }, []);

  const selectedName = regions.find((region) => region.id === regionId)?.name;

  return (
    <div className="mt-10 flex flex-col gap-6">
      <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:items-start md:gap-6">
        <RegionPicker regions={regions} regionId={regionId} onChange={setRegionId} />

        <section className="rounded-2xl bg-surface p-4 md:min-h-[360px] md:p-5">
          <p className="text-sm font-medium text-accent">선택 지역 후기</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            {selectedName ? `${selectedName} 맛집` : "전체 후기"}
          </h2>

          {loadingPosts ? (
            <p className="mt-6 text-sm text-muted">후기를 불러오는 중...</p>
          ) : posts.length === 0 ? (
            <p className="mt-6 text-sm text-muted">이 지역에 작성된 후기가 없습니다.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <PopularPosts posts={popular} loading={loadingPopular} />
    </div>
  );
}
