"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { formatDate } from "@/lib/date";

type Region = {
  id: number;
  name: string;
};

type Post = {
  id: number;
  title: string;
  region_name: string;
  nickname: string;
  created_at: string;
};

export function PostList() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionId, setRegionId] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      try {
        const query = regionId ? `?region_id=${regionId}` : "";
        const response = await fetch(`${API_URL}/api/posts${query}`);
        const data = (await response.json()) as { posts?: Post[] };
        setPosts(data.posts ?? []);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [regionId]);

  return (
    <section className="mt-10">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
        <button
          type="button"
          onClick={() => setRegionId(null)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
            regionId === null
              ? "bg-accent text-white"
              : "bg-field text-muted"
          }`}
        >
          전체
        </button>
        {regions.map((region) => (
          <button
            type="button"
            key={region.id}
            onClick={() => setRegionId(region.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              regionId === region.id
                ? "bg-accent text-white"
                : "bg-field text-muted"
            }`}
          >
            {region.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted">후기를 불러오는 중...</p>
      ) : posts.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          이 지역에 작성된 후기가 없습니다.
        </p>
      ) : (
        <ul className="mt-8">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className="group flex items-center gap-3 rounded-xl px-2 py-3 text-sm transition-colors duration-200 hover:bg-field"
              >
                <span className="shrink-0 text-accent">{post.region_name}</span>
                <span className="min-w-0 flex-1 truncate font-medium transition-colors duration-200 group-hover:text-accent">
                  {post.title}
                </span>
                <span className="shrink-0 text-subtle">{post.nickname}</span>
                <span className="shrink-0 text-subtle">
                  {formatDate(post.created_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
