"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/date";
import type { Comment } from "@/lib/types";

type CommentSectionProps = {
  postId: number;
};

export function CommentSection({ postId }: CommentSectionProps) {
  const { user, token, ready } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadComments() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/comments`);
      const data = (await response.json()) as {
        comments?: Comment[];
        message?: string;
      };
      if (!response.ok) {
        setError(data.message ?? "댓글을 불러오지 못했습니다.");
        return;
      }
      setComments(data.comments ?? []);
    } catch {
      setError("댓글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, [postId]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || !token) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message ?? "댓글을 등록하지 못했습니다.");
        return;
      }
      setContent("");
      await loadComments();
    } catch {
      setError("댓글을 등록하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(commentId: number) {
    if (!token) {
      return;
    }

    const confirmed = window.confirm("정말 이 댓글을 삭제하시겠습니까?");
    if (!confirmed) {
      return;
    }

    setDeletingId(commentId);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message ?? "댓글을 삭제하지 못했습니다.");
        return;
      }
      if (editingId === commentId) {
        setEditingId(null);
        setEditContent("");
      }
      await loadComments();
    } catch {
      setError("댓글을 삭제하지 못했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(comment: Comment) {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setError(null);
  }

  async function onSaveEdit(commentId: number) {
    const trimmed = editContent.trim();
    if (!trimmed || !token) {
      return;
    }

    setSavingId(commentId);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message ?? "댓글을 수정하지 못했습니다.");
        return;
      }
      setEditingId(null);
      setEditContent("");
      await loadComments();
    } catch {
      setError("댓글을 수정하지 못했습니다.");
    } finally {
      setSavingId(null);
    }
  }

  const loggedIn = Boolean(ready && user && token);

  return (
    <section className="mt-12 border-t border-[#ece7e1] pt-8">
      <h2 className="text-lg font-semibold tracking-tight">댓글 {comments.length}</h2>

      <form onSubmit={onSubmit} className="mt-5">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={!loggedIn || submitting}
          rows={3}
          maxLength={1000}
          placeholder={
            loggedIn
              ? "댓글을 입력해 주세요."
              : "로그인 후 댓글을 작성할 수 있습니다"
          }
          className="field-input mt-0 min-h-[96px] resize-none disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          {!loggedIn ? (
            <p className="text-sm text-muted">
              로그인 후 댓글을 작성할 수 있습니다.{" "}
              <Link href="/login" className="text-accent hover:underline">
                로그인
              </Link>
            </p>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={!loggedIn || submitting || !content.trim()}
            className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {submitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-muted">댓글을 불러오는 중...</p>
      ) : comments.length === 0 ? (
        <p className="mt-6 text-sm text-muted">아직 댓글이 없습니다.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {comments.map((comment) => {
            const isOwner = Boolean(user && user.id === comment.user_id);
            return (
              <li key={comment.id} className="rounded-2xl bg-surface px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-medium">{comment.nickname}</p>
                    <p className="shrink-0 text-xs text-subtle">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                  {isOwner && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(comment)}
                        disabled={savingId === comment.id || deletingId === comment.id}
                        className="rounded-xl px-2 py-1 text-xs text-muted transition-colors hover:text-foreground disabled:opacity-50"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(comment.id)}
                        disabled={deletingId === comment.id || savingId === comment.id}
                        className="rounded-xl px-2 py-1 text-xs text-muted transition-colors hover:text-red-600 disabled:opacity-50"
                      >
                        {deletingId === comment.id ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  )}
                </div>
                {editingId === comment.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editContent}
                      onChange={(event) => setEditContent(event.target.value)}
                      rows={3}
                      maxLength={1000}
                      className="field-input mt-0 min-h-[80px] resize-none"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditContent("");
                        }}
                        disabled={savingId === comment.id}
                        className="rounded-xl px-3 py-1.5 text-xs text-muted"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => onSaveEdit(comment.id)}
                        disabled={savingId === comment.id || !editContent.trim()}
                        className="rounded-xl bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                      >
                        {savingId === comment.id ? "저장 중..." : "수정 완료"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {comment.content}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
