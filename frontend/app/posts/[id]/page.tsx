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
import { recordPostView } from "@/lib/views";

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
    let cancelled = false;

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
        if (cancelled) {
          return;
        }
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok || !data.post) {
          setError(data.message ?? "게시글을 불러오지 못했습니다.");
          return;
        }
        setPost(data.post);
        const viewCount = await recordPostView(params.id);
        if (!cancelled && viewCount != null) {
          setPost((current) =>
            current ? { ...current, view_count: viewCount } : current,
          );
        }
      } catch {
        if (!cancelled) {
          setError("게시글을 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
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
          <Link href="/" className="mb-6 self-start text-sm text-muted hover:text-foreground">
            ← 목록으로
          </Link>

          <article>
            <p className="text-sm text-accent">
              {post.region_name}
              <span className="mx-1.5 text-subtle">·</span>
              <span className="text-muted">{post.restaurant_name}</span>
            </p>
            <h1 className="mt-2 text-[1.75rem] font-bold leading-snug tracking-tight md:text-3xl">
              {post.title}
            </h1>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eadfd4] text-sm font-semibold text-[#6a5d50]"
                >
                  {post.nickname.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{post.nickname}</p>
                  <p className="text-xs text-subtle">
                    {formatDate(post.created_at)} · 조회 {post.view_count ?? 0}
                  </p>
                </div>
              </div>
              {isOwner && (
                <div className="flex shrink-0 items-center gap-3 text-sm text-muted">
                  <Link href={`/posts/${post.id}/edit`} className="hover:text-foreground">
                    수정
                  </Link>
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={deleting}
                    className="hover:text-red-600 disabled:opacity-50"
                  >
                    {deleting ? "삭제 중..." : "삭제"}
                  </button>
                </div>
              )}
            </div>

            <div
              className="post-body mt-8"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          </article>

          <CommentSection postId={post.id} />
        </>
      )}
    </main>
  );
}
