"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLoading } from "@/components/PageLoading";
import { PostNotFound } from "@/components/PostNotFound";
import { CommentSection } from "@/components/CommentSection";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/date";
import { sanitizePostHtml } from "@/lib/sanitize";
import type { PostDetail } from "@/lib/types";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token, ready } = useAuth();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setNotFound(false);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/posts/${params.id}`);
        const data = (await response.json()) as {
          post?: PostDetail;
          message?: string;
        };
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok || !data.post) {
          setError(data.message ?? "게시글을 불러오지 못했습니다.");
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

  const safeHtml = useMemo(
    () => (post ? sanitizePostHtml(post.content) : ""),
    [post],
  );

  const isOwner = Boolean(ready && user && post && user.id === post.user_id);

  async function onDelete() {
    if (!token || !post) {
      return;
    }

    const confirmed = window.confirm("정말 이 맛집 후기를 삭제하시겠습니까?");
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/posts/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        window.alert(data.message ?? "게시글을 삭제하지 못했습니다.");
        return;
      }

      window.alert("삭제되었습니다");
      router.push("/");
    } catch {
      window.alert("게시글을 삭제하지 못했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-5 pb-24 pt-8">
      {loading && <PageLoading label="게시글을 불러오는 중..." />}
      {!loading && notFound && <PostNotFound />}
      {!loading && error && (
        <div>
          <p className="text-sm text-red-600">{error}</p>
          <Link href="/" className="mt-6 inline-block text-sm text-accent">
            메인으로 돌아가기
          </Link>
        </div>
      )}
      {!loading && post && (
        <>
          <span className="w-fit rounded-full bg-field px-3 py-1 text-xs font-medium text-accent">
            {post.region_name}
          </span>
          <p className="mt-4 text-sm text-muted">{post.restaurant_name}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-subtle">
              {post.nickname} · {formatDate(post.created_at)}
            </p>
            {isOwner && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="rounded-xl bg-field px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
                >
                  수정하기
                </Link>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting}
                  className="rounded-xl px-3 py-1.5 text-sm text-muted transition-colors hover:text-red-600 disabled:opacity-50"
                >
                  {deleting ? "삭제 중..." : "삭제하기"}
                </button>
              </div>
            )}
          </div>
          {post.image_url && (
            <div className="mt-8 overflow-hidden rounded-2xl bg-field">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image_url}
                alt={post.restaurant_name}
                className="max-h-[420px] w-full object-cover"
              />
            </div>
          )}
          <div
            className="post-body mt-8"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
          <CommentSection postId={post.id} />
          <Link href="/" className="btn-quiet mt-10 self-start px-0">
            목록으로
          </Link>
        </>
      )}
    </main>
  );
}
