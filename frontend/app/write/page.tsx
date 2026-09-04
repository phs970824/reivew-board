"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PostForm } from "@/components/PostForm";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { PostDetail, Region } from "@/lib/types";

export default function WritePage() {
  const router = useRouter();
  const { user, token, ready } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionId, setRegionId] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);
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
      const data = (await response.json()) as {
        message?: string;
        post?: PostDetail;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "게시글 등록에 실패했습니다.");
      }

      if (data.post?.id) {
        router.push(`/posts/${data.post.id}`);
        return;
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready || !user) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-5 pb-20 pt-6">
      <Link href="/" className="mb-6 self-start text-sm text-muted hover:text-foreground">
        ← 목록으로
      </Link>
      <p className="page-label">후기 작성</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">맛집 기록하기</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        다녀온 식당과 솔직한 느낌을 남겨 주세요.
      </p>
      <PostForm
        regions={regions}
        regionId={regionId}
        restaurantName={restaurantName}
        title={title}
        content={content}
        error={error}
        submitting={submitting}
        submitLabel="등록하기"
        submittingLabel="등록 중..."
        onRegionIdChange={setRegionId}
        onRestaurantNameChange={setRestaurantName}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onSubmit={onSubmit}
      />
    </main>
  );
}
