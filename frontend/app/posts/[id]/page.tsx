"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_URL } from "@/lib/api";
import { formatDate } from "@/lib/date";

type Post = {
  id: number;
  title: string;
  restaurant_name: string;
  region_name: string;
  nickname: string;
  content: string;
  created_at: string;
};

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API_URL}/api/posts/${params.id}`);
        const data = (await response.json()) as { post?: Post; message?: string };
        if (!response.ok || !data.post) {
          setError(data.message ?? "게시글을 찾을 수 없습니다.");
          return;
        }
        setPost(data.post);
      } catch {
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-5 pb-24 pt-8">
      {loading && <p className="text-sm text-muted">불러오는 중...</p>}
      {error && (
        <div>
          <p className="text-sm text-red-600">{error}</p>
          <Link href="/" className="mt-6 inline-block text-sm text-accent">
            목록으로 돌아가기
          </Link>
        </div>
      )}
      {post && (
        <>
          <p className="page-label">{post.region_name}</p>
          <p className="mt-3 text-sm text-muted">{post.restaurant_name}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{post.title}</h1>
          <p className="mt-3 text-sm text-subtle">
            {post.nickname} · {formatDate(post.created_at)}
          </p>
          <div
            className="post-body mt-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <Link href="/" className="btn-quiet mt-10 self-start px-0">
            목록으로 돌아가기
          </Link>
        </>
      )}
    </main>
  );
}
