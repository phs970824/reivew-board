import { PostCard } from "@/components/PostCard";
import type { PostSummary } from "@/lib/types";

type PopularPostsProps = {
  posts: PostSummary[];
  loading: boolean;
};

export function PopularPosts({ posts, loading }: PopularPostsProps) {
  return (
    <section className="rounded-2xl bg-surface p-4 md:p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">인기글</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">요즘 많이 찾는 후기</h2>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-muted">인기글을 불러오는 중...</p>
      ) : posts.length === 0 ? (
        <p className="mt-6 text-sm text-muted">아직 인기글이 없습니다.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
