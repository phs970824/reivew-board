import Link from "next/link";
import type { PostSummary } from "@/lib/types";

type PostCardProps = {
  post: PostSummary;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="group flex flex-col justify-center rounded-2xl bg-field px-4 py-3 transition-colors hover:bg-[#e7e1da]"
    >
      <span className="w-fit rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-accent">
        {post.region_name}
      </span>
      <div className="mt-2 flex min-w-0 items-baseline gap-2">
        <p className="max-w-[42%] shrink-0 truncate text-sm text-muted">
          {post.restaurant_name}
        </p>
        <span className="shrink-0 text-xs text-subtle" aria-hidden>
          |
        </span>
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold transition-colors group-hover:text-accent">
          {post.title}
        </h3>
      </div>
    </Link>
  );
}
