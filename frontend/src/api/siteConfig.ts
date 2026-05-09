import { api } from './index';

export const siteConfigApi = {
  get: (key: string) => api.get(`/site-config/${key}`),

  getAll: () => api.get<Record<string, string>>('/site-config'),

  update: (key: string, value: string) =>
    api.put(`/site-config/${key}`, { value }),
};
