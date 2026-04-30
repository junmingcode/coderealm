import { api } from './index';
import type { Tag } from '../types';

export const tagApi = {
  getList: () => api.get<Tag[]>('/tags'),

  getBySlug: (slug: string) =>
    api.get<Tag>(`/tags/${slug}`),
};
