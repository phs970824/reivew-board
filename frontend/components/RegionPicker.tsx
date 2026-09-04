import type { Region } from "@/lib/types";

type RegionPickerProps = {
  regions: Region[];
  regionId: number | null;
  onChange: (regionId: number | null) => void;
};

export function RegionPicker({ regions, regionId, onChange }: RegionPickerProps) {
  const selected = regions.find((region) => region.id === regionId);

  return (
    <section className="rounded-2xl bg-surface p-4 md:p-5">
      <p className="text-sm font-medium text-accent">지도 / 지역 선택</p>
      <div className="mt-3 flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-[#ddd6ce] bg-field px-4 text-center md:min-h-[280px]">
        <span className="text-sm font-medium text-muted">지도 이미지 맵 예정</span>
        <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-subtle">
          이후 이 자리에 지역 선택 지도가 들어갑니다. 지금은 아래에서 지역을 골라 주세요.
        </p>
        <p className="mt-4 text-sm text-foreground">
          {selected ? selected.name : "전체 지역"}
        </p>
      </div>

      <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
            regionId === null ? "bg-accent text-white" : "bg-field text-muted"
          }`}
        >
          전체
        </button>
        {regions.map((region) => (
          <button
            type="button"
            key={region.id}
            onClick={() => onChange(region.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              regionId === region.id ? "bg-accent text-white" : "bg-field text-muted"
            }`}
          >
            {region.name}
          </button>
        ))}
      </div>
    </section>
  );
}
