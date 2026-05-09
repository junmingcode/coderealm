import { api } from './index';
import type { Tag } from '../types';

export const tagApi = {
  getList: () => api.get<Tag[]>('/tags'),

  getBySlug: (slug: string) => api.get<Tag>(`/tags/${slug}`),

  create: (data: { name: string; slug?: string }) =>
    api.post<Tag>('/tags', data),

  update: (id: number, data: { name?: string; slug?: string }) =>
    api.put<Tag>(`/tags/${id}`, data),

  remove: (id: number) => api.delete(`/tags/${id}`),
};
