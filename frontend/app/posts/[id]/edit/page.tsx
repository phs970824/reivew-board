"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLoading } from "@/components/PageLoading";
import { PostForm } from "@/components/PostForm";
import { PostNotFound } from "@/components/PostNotFound";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { PostDetail, Region } from "@/lib/types";

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token, ready } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionId, setRegionId] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const [postRes, regionRes] = await Promise.all([
          fetch(`${API_URL}/api/posts/${params.id}`),
          fetch(`${API_URL}/api/regions`),
        ]);
        const postData = (await postRes.json()) as {
          post?: PostDetail;
          message?: string;
        };
        const regionData = (await regionRes.json()) as { regions?: Region[] };
        setRegions(regionData.regions ?? []);

        if (postRes.status === 404 || !postData.post) {
          if (postRes.status === 404) {
            setNotFound(true);
          } else {
            setError(postData.message ?? "게시글을 불러오지 못했습니다.");
          }
          return;
        }

        const post = postData.post;
        if (!ready) {
          return;
        }

        if (!user || user.id !== post.user_id) {
          window.alert("수정 권한이 없습니다");
          router.replace("/");
          return;
        }

        setRegionId(String(post.region_id));
        setRestaurantName(post.restaurant_name);
        setTitle(post.title);
        setContent(post.content);
        setAllowed(true);
      } catch {
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    if (ready) {
      load();
    }
  }, [params.id, ready, user, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const plain = content.replace(/<[^>]*>/g, "").trim();

    if (!regionId || !restaurantName.trim() || !title.trim() || !plain) {
      setError("지역, 맛집 이름, 제목, 본문을 모두 입력해 주세요.");
      return;
    }

    if (!token) {
      window.alert("수정 권한이 없습니다");
      router.replace("/");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/posts/${params.id}`, {
        method: "PUT",
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

      if (response.status === 403) {
        window.alert("수정 권한이 없습니다");
        router.replace("/");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message ?? "게시글 수정에 실패했습니다.");
      }

      router.push(`/posts/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-5 pb-20 pt-6">
      {(!ready || loading) && <PageLoading label="게시글을 불러오는 중..." />}
      {ready && !loading && notFound && <PostNotFound />}
      {ready && !loading && error && !allowed && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {ready && !loading && allowed && (
        <>
          <p className="page-label">후기 수정</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">맛집 기록 고치기</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            지역, 식당 이름, 제목, 본문을 수정할 수 있습니다.
          </p>
          <PostForm
            regions={regions}
            regionId={regionId}
            restaurantName={restaurantName}
            title={title}
            content={content}
            error={error}
            submitting={submitting}
            submitLabel="수정 완료"
            submittingLabel="수정 중..."
            onRegionIdChange={setRegionId}
            onRestaurantNameChange={setRestaurantName}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onSubmit={onSubmit}
          />
        </>
      )}
    </main>
  );
}
