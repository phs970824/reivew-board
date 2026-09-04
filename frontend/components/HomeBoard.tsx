"use client";

import { useEffect, useState } from "react";
import { PaginationControls } from "@/components/PaginationControls";
import { PhotoGallerySection } from "@/components/PhotoGallerySection";
import { PopularPosts } from "@/components/PopularPosts";
import { PostCard } from "@/components/PostCard";
import { RegionPicker } from "@/components/RegionPicker";
import { API_URL } from "@/lib/api";
import type { GalleryPost, Pagination, PostSummary, Region } from "@/lib/types";

const PAGE_LIMIT = 4;
const POPULAR_LIMIT = 5;

export function HomeBoard() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionId, setRegionId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [popular, setPopular] = useState<PostSummary[]>([]);
  const [popularPage, setPopularPage] = useState(1);
  const [popularPagination, setPopularPagination] = useState<Pagination | null>(null);
  const [gallery, setGallery] = useState<GalleryPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);

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
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_LIMIT),
        });
        if (regionId) {
          params.set("region_id", String(regionId));
        }
        const response = await fetch(`${API_URL}/api/posts?${params.toString()}`);
        const data = (await response.json()) as {
          posts?: PostSummary[];
          pagination?: Pagination;
        };
        setPosts(data.posts ?? []);
        setPagination(data.pagination ?? null);
      } finally {
        setLoadingPosts(false);
      }
    }
    loadPosts();
  }, [regionId, page]);

  useEffect(() => {
    async function loadPopular() {
      setLoadingPopular(true);
      try {
        const params = new URLSearchParams({
          page: String(popularPage),
          limit: String(POPULAR_LIMIT),
        });
        const response = await fetch(`${API_URL}/api/posts/popular?${params.toString()}`);
        const data = (await response.json()) as {
          posts?: PostSummary[];
          pagination?: Pagination;
        };
        setPopular(data.posts ?? []);
        setPopularPagination(data.pagination ?? null);
      } finally {
        setLoadingPopular(false);
      }
    }
    loadPopular();
  }, [popularPage]);

  useEffect(() => {
    async function loadGallery() {
      setLoadingGallery(true);
      try {
        const response = await fetch(`${API_URL}/api/posts/gallery`);
        const data = (await response.json()) as { posts?: GalleryPost[] };
        setGallery(data.posts ?? []);
      } finally {
        setLoadingGallery(false);
      }
    }
    loadGallery();
  }, []);

  function onRegionChange(nextRegionId: number | null) {
    setRegionId(nextRegionId);
    setPage(1);
  }

  const selectedName = regions.find((region) => region.id === regionId)?.name;

  return (
    <div className="mt-10 flex flex-col gap-6">
      <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:items-stretch md:gap-6">
        <RegionPicker regions={regions} regionId={regionId} onChange={onRegionChange} />

        <section className="rounded-2xl bg-surface p-4 md:min-h-[492px] md:p-5">
          <p className="text-sm font-medium text-accent">🌍 선택 지역</p>
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

          {pagination && pagination.totalCount > 0 && (
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={Math.max(pagination.totalPages, 1)}
              onPageChange={setPage}
            />
          )}
        </section>
      </div>

      <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-6">
        <PopularPosts
          posts={popular}
          loading={loadingPopular}
          pagination={popularPagination}
          onPageChange={setPopularPage}
        />
        <PhotoGallerySection posts={gallery} loading={loadingGallery} />
      </div>
    </div>
  );
}
