import dynamic from "next/dynamic";
import { FormEvent } from "react";
import type { Region } from "@/lib/types";

const PostEditor = dynamic(
  () => import("@/components/PostEditor").then((mod) => mod.PostEditor),
  { ssr: false, loading: () => <p className="text-sm text-muted">에디터 불러오는 중...</p> },
);

type PostFormProps = {
  regions: Region[];
  regionId: string;
  restaurantName: string;
  title: string;
  content: string;
  error: string | null;
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  onRegionIdChange: (value: string) => void;
  onRestaurantNameChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function PostForm({
  regions,
  regionId,
  restaurantName,
  title,
  content,
  error,
  submitting,
  submitLabel,
  submittingLabel,
  onRegionIdChange,
  onRestaurantNameChange,
  onTitleChange,
  onContentChange,
  onSubmit,
}: PostFormProps) {
  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <label className="block">
        <span className="text-sm text-muted">지역</span>
        <select
          value={regionId}
          onChange={(event) => onRegionIdChange(event.target.value)}
          className="field-input"
        >
          <option value="">지역을 선택해 주세요</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm text-muted">맛집 이름</span>
        <input
          type="text"
          value={restaurantName}
          onChange={(event) => onRestaurantNameChange(event.target.value)}
          className="field-input"
          maxLength={100}
        />
      </label>
      <label className="block">
        <span className="text-sm text-muted">제목</span>
        <input
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="field-input"
          maxLength={255}
        />
      </label>
      <div>
        <span className="text-sm text-muted">본문</span>
        <div className="mt-2">
          <PostEditor value={content} onChange={onContentChange} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-accent">
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
