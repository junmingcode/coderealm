import { api } from './index';
import type { Category } from '../types';

export const categoryApi = {
  getList: () => api.get<Category[]>('/categories'),
};
