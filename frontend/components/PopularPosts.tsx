import { PaginationControls } from "@/components/PaginationControls";
import { PostCard } from "@/components/PostCard";
import type { Pagination, PostSummary } from "@/lib/types";

type PopularPostsProps = {
  posts: PostSummary[];
  loading: boolean;
  pagination: Pagination | null;
  onPageChange: (page: number) => void;
};

export function PopularPosts({ posts, loading, pagination, onPageChange }: PopularPostsProps) {
  return (
    <section className="rounded-2xl bg-surface p-4 md:p-5">
      <p className="text-sm font-medium text-accent">🔥인기글 </p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight">요즘 많이 찾는 후기</h2>

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

      {pagination && pagination.totalCount > 0 && (
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={Math.max(pagination.totalPages, 1)}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
}
