export type Region = {
  id: number;
  name: string;
};

export type PostSummary = {
  id: number;
  user_id: number;
  region_id: number;
  title: string;
  restaurant_name: string;
  image_url: string | null;
  created_at: string;
  nickname: string;
  region_name: string;
};

export type PostDetail = PostSummary & {
  content: string;
};
