import { api } from './index';
import type { Article, PaginatedResponse } from '../types';

export const articleApi = {
  getList: (params?: { page?: number; page_size?: number; category?: string; tag?: string }) =>
    api.get<PaginatedResponse<Article>>('/articles', { params }),

  getBySlug: (slug: string) =>
    api.get<Article>(`/articles/${slug}`),

  create: (data: Partial<Article>) =>
    api.post<Article>('/articles', data),

  update: (id: number, data: Partial<Article>) =>
    api.put<Article>(`/articles/${id}`, data),

  delete: (id: number) =>
    api.delete(`/articles/${id}`),

  search: (q: string, params?: { page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<Article>>('/articles/search/query', { params: { q, ...params } }),
};
