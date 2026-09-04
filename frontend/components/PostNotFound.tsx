import Link from "next/link";

export function PostNotFound() {
  return (
    <div className="flex flex-1 flex-col items-start pt-8">
      <p className="text-base font-medium tracking-tight">
        존재하지 않거나 삭제된 게시글입니다
      </p>
      <p className="mt-2 text-sm text-muted">
        주소가 잘못되었거나, 이미 삭제된 후기일 수 있습니다.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        메인으로 돌아가기
      </Link>
    </div>
  );
}
