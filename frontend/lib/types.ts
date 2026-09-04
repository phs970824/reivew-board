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

export type GalleryPost = {
  id: number;
  title: string;
  restaurantName: string;
  imageUrl: string;
};

export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
};

export type Comment = {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  nickname: string;
};
