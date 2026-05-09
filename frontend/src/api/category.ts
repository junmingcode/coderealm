import { api } from './index';
import type { Category } from '../types';

export const categoryApi = {
  getList: () => api.get<Category[]>('/categories'),

  create: (data: { name: string; slug?: string; description?: string }) =>
    api.post<Category>('/categories', data),

  update: (id: number, data: { name?: string; slug?: string; description?: string }) =>
    api.put<Category>(`/categories/${id}`, data),

  remove: (id: number) => api.delete(`/categories/${id}`),
};
