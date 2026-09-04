"use client";

import { useEffect, useRef, useState } from "react";
import type { Region } from "@/lib/types";

type RegionPickerProps = {
  regions: Region[];
  regionId: number | null;
  onChange: (regionId: number | null) => void;
};

const SVG_ID_TO_NAME: Record<string, string> = {
  seoul: "서울",
  gyeonggi: "경기",
  gangwon: "강원",
  chungcheong: "충청",
  jeolla: "전라",
  gyeongsang: "경상",
  jeju: "제주",
};

export function RegionPicker({ regions, regionId, onChange }: RegionPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const selected = regions.find((region) => region.id === regionId);

  useEffect(() => {
    const box = mapRef.current;
    if (!box) {
      return;
    }

    let cancelled = false;

    fetch("/map.svg")
      .then((response) => response.text())
      .then((svg) => {
        if (cancelled || !mapRef.current) {
          return;
        }

        mapRef.current.innerHTML = svg.replace(/<script[\s\S]*?<\/script>/gi, "");
        const root = mapRef.current.querySelector("svg");
        if (root) {
          root.setAttribute("viewBox", "45 50 460 830");
          root.setAttribute("preserveAspectRatio", "xMidYMid meet");
          root.removeAttribute("width");
          root.removeAttribute("height");
          root.style.display = "block";
          root.style.width = "100%";
          root.style.height = "100%";
          root.style.margin = "0";
        }
        setMapReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const box = mapRef.current;
    if (!box) {
      return;
    }

    function onClick(event: MouseEvent) {
      const target = (event.target as Element | null)?.closest(".region");
      if (!target) {
        return;
      }

      const name = SVG_ID_TO_NAME[target.id];
      const region = regions.find((item) => item.name === name);
      if (!region) {
        return;
      }

      onChange(regionId === region.id ? null : region.id);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      const target = (event.target as Element | null)?.closest(".region");
      if (!target) {
        return;
      }
      event.preventDefault();
      target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }

    box.addEventListener("click", onClick);
    box.addEventListener("keydown", onKeyDown);
    return () => {
      box.removeEventListener("click", onClick);
      box.removeEventListener("keydown", onKeyDown);
    };
  }, [regions, regionId, onChange]);

  useEffect(() => {
    const box = mapRef.current;
    if (!box || !mapReady) {
      return;
    }

    const selectedName = selected?.name;
    box.querySelectorAll(".region").forEach((element) => {
      const name = SVG_ID_TO_NAME[element.id];
      element.classList.toggle("active", Boolean(selectedName && name === selectedName));
    });
  }, [mapReady, selected]);

  return (
    <section className="flex h-full min-h-[320px] flex-col rounded-2xl bg-surface p-4 md:min-h-[492px] md:p-5">
      <div className="relative min-h-0 flex-1 rounded-xl bg-field">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`absolute left-3 top-3 z-10 cursor-pointer rounded-full px-3.5 py-1.5 text-sm transition-colors ${
            regionId === null ? "bg-accent text-white" : "bg-surface text-muted"
          }`}
        >
          전체
        </button>
        <div ref={mapRef} className="absolute inset-0" aria-label="지역 선택 지도" />
      </div>
    </section>
  );
}
