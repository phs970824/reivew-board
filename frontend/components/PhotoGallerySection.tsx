"use client";

import Link from "next/link";
import { useState } from "react";
import type { GalleryPost } from "@/lib/types";

const GALLERY_SIZE = 9;

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <rect fill="#efebe6" width="400" height="400"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9a948c" font-size="22" font-family="sans-serif">사진 없음</text>
    </svg>`,
  );

const cellClassName =
  "relative block aspect-square overflow-hidden border border-[#d8d0c6] bg-field";

type PhotoGallerySectionProps = {
  posts: GalleryPost[];
  loading: boolean;
};

function GalleryCard({ post }: { post: GalleryPost }) {
  const [src, setSrc] = useState(post.imageUrl);

  return (
    <Link href={`/posts/${post.id}`} className={`group ${cellClassName}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={post.restaurantName || post.title}
        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        onError={() => {
          if (src !== PLACEHOLDER) {
            setSrc(PLACEHOLDER);
          }
        }}
      />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 px-2 text-center text-[13px] leading-snug text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:text-sm">
        <span className="line-clamp-2">{post.restaurantName}</span>
      </span>
    </Link>
  );
}

function EmptyCell() {
  return <div className={cellClassName} aria-hidden="true" />;
}

export function PhotoGallerySection({ posts, loading }: PhotoGallerySectionProps) {
  const cells = Array.from({ length: GALLERY_SIZE }, (_, index) =>
    loading ? null : (posts[index] ?? null),
  );

  return (
    <section className="rounded-2xl bg-surface p-4 md:p-5">
      <p className="text-sm font-medium text-accent">🍚 맛집 갤러리</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight">사진으로 보는 후기</h2>

      <div className="mt-4 grid grid-cols-3">
        {cells.map((post, index) =>
          post ? <GalleryCard key={post.id} post={post} /> : <EmptyCell key={`empty-${index}`} />,
        )}
      </div>
    </section>
  );
}
