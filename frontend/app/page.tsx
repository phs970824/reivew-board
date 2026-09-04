import { HomeBoard } from "@/components/HomeBoard";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-5 pb-24 pt-8 md:max-w-[1100px]">
      <h1 className="text-4xl font-bold leading-tight tracking-tight">
        동네 맛집,<br className="md:hidden" /> 여기 다 있어요
      </h1>
      <p className="mt-5 max-w-[520px] text-base leading-relaxed text-[#3d3a36]">
        직접 다녀온 맛집 후기를 지역별로 만나보세요.
      </p>
      <HomeBoard />
    </main>
  );
}
