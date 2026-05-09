import { api } from './index';

export const statsApi = {
  getOverview: () => api.get('/stats/overview'),

  getDailyViews: (days?: number) =>
    api.get<{ date: string; count: number }[]>('/stats/views/daily', { params: { days } }),

  getTopArticles: (days?: number, limit?: number) =>
    api.get<{ id: number; title: string; slug: string; views: number }[]>('/stats/views/top-articles', {
      params: { days, limit },
    }),
};
