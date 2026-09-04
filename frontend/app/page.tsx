import Link from "next/link";
import { HomeBoard } from "@/components/HomeBoard";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-5 pb-24 pt-8 md:max-w-[1100px]">
      <p className="page-label">지역별 맛집</p>
      <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
        우리 동네
        <br />
        숨은 맛집을 나눠요
      </h1>
      <p className="mt-5 max-w-[520px] text-base leading-relaxed text-muted">
        방문한 식당의 솔직한 후기를 지역별로 모아보는 공간입니다.
      </p>
      <Link
        href="/write"
        className="mt-8 inline-flex w-fit rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        후기 작성하기
      </Link>
      <HomeBoard />
    </main>
  );
}
