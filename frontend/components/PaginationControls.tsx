type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 0) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="게시글 페이지"
      className="mt-6 flex flex-wrap items-center justify-center gap-1"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-xl px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        이전
      </button>
      {pages.map((page) => {
        const active = page === currentPage;
        return (
          <button
            type="button"
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={active ? "page" : undefined}
            className={`min-w-8 rounded-xl px-3 py-1.5 text-sm transition-colors ${
              active
                ? "bg-accent font-medium text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {page}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-xl px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        다음
      </button>
    </nav>
  );
}
