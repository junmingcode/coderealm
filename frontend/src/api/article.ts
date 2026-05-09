import { api } from './index';
import type { Article, PaginatedResponse } from '../types';

export const articleApi = {
  getList: (params?: {
    page?: number;
    page_size?: number;
    category?: string;
    tag?: string;
    q?: string;
    status?: string;
    category_id?: number;
    sort_by?: string;
    sort_order?: string;
  }) => api.get<PaginatedResponse<Article>>('/articles', { params }),

  getBySlug: (slug: string, signal?: AbortSignal) =>
    api.get<Article>(`/articles/${slug}`, { signal }),

  getNeighbors: (slug: string, signal?: AbortSignal) =>
    api.get<{ previous: { slug: string; title: string } | null; next: { slug: string; title: string } | null }>(`/articles/${slug}/neighbors`, { signal }),

  getById: (id: number) =>
    api.get<Article>(`/articles/admin/${id}`),

  create: (data: Partial<Article>) =>
    api.post<Article>('/articles', data),

  update: (id: number, data: Partial<Article>) =>
    api.put<Article>(`/articles/${id}`, data),

  delete: (id: number) =>
    api.delete(`/articles/${id}`),

  search: (q: string, params?: { page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<Article>>('/articles/search/query', { params: { q, ...params } }),
};
