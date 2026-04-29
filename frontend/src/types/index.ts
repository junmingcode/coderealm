export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  article_count: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  article_count: number;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  cover_image?: string;
  status: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at?: string;
  published_at?: string;
  category?: Category;
  tags: Tag[];
}

export interface Comment {
  id: number;
  article_id: number;
  parent_id?: number;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  created_at: string;
  replies: Comment[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface StatsOverview {
  total_articles: number;
  published_articles: number;
  draft_articles: number;
  total_comments: number;
  total_likes: number;
  total_views: number;
}
