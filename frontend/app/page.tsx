export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <p className="text-lg font-semibold">맛집 후기</p>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium text-orange-600">지역별 맛집</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          우리 동네 맛집을 나눠요
        </h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          방문한 식당 후기를 지역별로 공유하는 게시판입니다. 곧 오픈 준비 중입니다.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="font-semibold">지역별 둘러보기</h2>
            <p className="mt-2 text-sm text-zinc-500">곧 오픈합니다.</p>
          </section>
          <section className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="font-semibold">후기 작성하기</h2>
            <p className="mt-2 text-sm text-zinc-500">곧 오픈합니다.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
