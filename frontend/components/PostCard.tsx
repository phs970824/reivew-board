import Link from "next/link";
import { formatDate } from "@/lib/date";
import type { PostSummary } from "@/lib/types";

type PostCardProps = {
  post: PostSummary;
  compact?: boolean;
};

export function PostCard({ post, compact = false }: PostCardProps) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className={`group flex overflow-hidden rounded-2xl bg-surface shadow-[0_1px_0_rgba(26,26,26,0.04)] transition-transform duration-200 hover:-translate-y-0.5 ${
        compact ? "min-w-[240px] shrink-0 snap-start flex-col" : "flex-col sm:flex-row"
      }`}
    >
      <div
        className={`relative bg-field ${
          compact ? "h-36 w-full" : "h-40 w-full sm:h-auto sm:w-40"
        }`}
      >
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt={post.restaurant_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full min-h-36 items-center justify-center text-xs text-subtle">
            사진 없음
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
        <span className="w-fit rounded-full bg-field px-2.5 py-0.5 text-xs font-medium text-accent">
          {post.region_name}
        </span>
        <p className="mt-2 truncate text-sm text-muted">{post.restaurant_name}</p>
        <h3 className="mt-1 truncate text-base font-semibold transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        <p className="mt-2 text-xs text-subtle">
          {post.nickname} · {formatDate(post.created_at)}
        </p>
      </div>
    </Link>
  );
}
