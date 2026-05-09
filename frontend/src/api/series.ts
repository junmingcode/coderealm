import { api } from './index';

export interface SeriesItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  article_count: number;
  articles?: { id: number; title: string; slug: string; series_order: number | null; published_at?: string | null; reading_time?: number }[];
}

export const seriesApi = {
  getList: () => api.get<SeriesItem[]>('/series'),

  getBySlug: (slug: string) => api.get<SeriesItem>(`/series/${slug}`),

  create: (data: { name: string; slug?: string; description?: string; cover_image?: string }) =>
    api.post<SeriesItem>('/series', data),

  update: (id: number, data: { name?: string; slug?: string; description?: string; cover_image?: string }) =>
    api.put<SeriesItem>(`/series/${id}`, data),

  remove: (id: number) => api.delete(`/series/${id}`),
};
